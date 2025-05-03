import axios, { AxiosError } from 'axios'
// Import types used in the API responses
import {
  InterviewQuestion,
  InterviewFeedback,
  InterviewSession,
  PastInterview,
  QuestionRating,
} from '../types/interview'

class InterviewService {
  // Setup axios instance for API calls with default settings
  private apiClient = axios.create({
    baseURL: '/api', // All requests will start with this base URL
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Allow sending cookies with requests
  })

  constructor() {
    // Add an interceptor to attach the auth token to every request
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )
  }

  // Handles API errors and logs useful info
  private handleError(error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{
        error?: string
        detail?: string
      }>
      const serverMessage =
        axiosError.response?.data?.error || axiosError.response?.data?.detail
      const errorMessage = serverMessage || axiosError.message
      console.error('API Error:', {
        status: axiosError.response?.status,
        message: errorMessage,
        url: axiosError.config?.url,
      })
      throw new Error(errorMessage)
    }
    throw new Error('An unexpected error occurred')
  }

  // Starts a new interview session
  async startInterview(): Promise<InterviewSession> {
    try {
      console.log('Starting interview...')
      console.log('Token:', localStorage.getItem('token'))

      const response = await this.apiClient.post<InterviewSession>(
        '/interviews/start/'
      )
      console.log('Interview started successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('Error starting interview:', error)
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response)
        console.error('Request:', error.request)
      }
      throw this.handleError(error)
    }
  }

  // Gets the next question from the server
  async getNextQuestion(): Promise<InterviewQuestion> {
    try {
      const response = await this.apiClient.get<InterviewQuestion>(
        '/interviews/questions/next/'
      )
      return response.data
    } catch (error) {
      console.error('Error fetching next question:', error)
      throw this.handleError(error)
    }
  }

  // Sends user's response to a question
  async submitResponse(
    sessionId: number,
    questionId: number,
    text: string
  ): Promise<InterviewFeedback> {
    try {
      const response = await this.apiClient.post<InterviewFeedback>(
        `/interviews/${sessionId}/submit/`,
        { questionId, text }
      )
      return response.data
    } catch (error) {
      console.error('Error submitting response:', error)
      throw this.handleError(error)
    }
  }

  // Completes the current interview session
  async completeInterview(sessionId: number): Promise<void> {
    try {
      await this.apiClient.post(`/interviews/${sessionId}/complete/`)
    } catch (error) {
      console.error('Error completing interview:', error)
      throw this.handleError(error)
    }
  }

  // Fetches list of past interviews with pagination support
  async getPastInterviews(
    page = 1,
    limit = 10
  ): Promise<{ results: PastInterview[]; count: number }> {
    try {
      console.log('Fetching past interviews...', { page, limit })
      const response = await this.apiClient.get<{
        results: PastInterview[]
        count: number
      }>('/interviews/history/', {
        params: { page, limit },
      })
      console.log('Past interviews response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching past interviews:', error)
      throw this.handleError(error)
    }
  }

  // Lets the user rate a question as helpful or not
  async rateQuestion(
    questionId: number,
    interviewId: number,
    rating: string
  ): Promise<QuestionRating> {
    try {
      const response = await this.apiClient.post<QuestionRating>(
        '/interviews/question/rate/',
        {
          question_id: questionId,
          interview_id: interviewId,
          rating: rating,
        }
      )
      return response.data
    } catch (error) {
      console.error('Error rating question:', error)
      throw this.handleError(error)
    }
  }

  // Submits final feedback at the end of the interview
  async submitFeedback(
    interviewId: number,
    content: string,
    rating: number
  ): Promise<InterviewFeedback> {
    try {
      const response = await this.apiClient.post<InterviewFeedback>(
        `/interviews/${interviewId}/feedback/`,
        {
          content,
          rating,
        }
      )
      return response.data
    } catch (error) {
      console.error('Error submitting feedback:', error)
      throw this.handleError(error)
    }
  }

  // Gets the user's past rating for a specific question if available
  async getQuestionRating(
    questionId: number,
    interviewId: number
  ): Promise<QuestionRating | null> {
    try {
      const response = await this.apiClient.get<QuestionRating | null>(
        '/interviews/question/rating/',
        {
          params: {
            question_id: questionId,
            interview_id: interviewId,
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching question rating:', error)
      return null
    }
  }
}

// Export a single instance of the service
export const interviewService = new InterviewService()
