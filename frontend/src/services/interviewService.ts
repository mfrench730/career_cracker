// Import axios for HTTP requests and AxiosError for error typing
import axios, { AxiosError } from 'axios'

// Import relevant TypeScript types for interview data
import {
  InterviewQuestion,
  InterviewFeedback,
  InterviewSession,
  PastInterview,
  QuestionRating,
} from '../types/interview'

// Service class to handle all interview-related API interactions
class InterviewService {
  // Create an Axios instance with default configuration
  private apiClient = axios.create({
    baseURL: '/api', // Base URL for API endpoints
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Include cookies (if needed)
  })

  constructor() {
    // Intercept each request to add the JWT token to headers if available
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

  // Handles and standardizes error logging and formatting
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

  // Start a new interview session
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
      throw this.handleError(error)
    }
  }

  // Get the next interview question
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

  // Submit a response to a question in the current session
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

  // Complete the current interview session
  async completeInterview(sessionId: number): Promise<void> {
    try {
      await this.apiClient.post(`/interviews/${sessionId}/complete/`)
    } catch (error) {
      console.error('Error completing interview:', error)
      throw this.handleError(error)
    }
  }

  // Fetch paginated list of past interviews
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

  // Rate a specific question from an interview
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

  // Submit general feedback for an interview session
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

  // Retrieve a rating for a specific question in an interview
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
      return null // Gracefully handle error by returning null
    }
  }
}

// Export a singleton instance of the InterviewService
export const interviewService = new InterviewService()