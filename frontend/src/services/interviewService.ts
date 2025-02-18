// src/services/interviewService.ts
import axios, { AxiosError } from 'axios'
import {
  InterviewQuestion,
  InterviewFeedback,
  InterviewSession,
  PastInterview,
} from '../types/interview'

class InterviewService {
  private apiClient = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  })

  constructor() {
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }

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

  async startInterview(): Promise<InterviewSession> {
    try {
      console.log('Starting interview...')
      console.log('Token:', localStorage.getItem('token')) // Check token

      const response = await this.apiClient.post<InterviewSession>(
        '/interviews/start/'
      )
      console.log('Interview started successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('Error starting interview:', error)
      // More detailed error logging
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response)
        console.error('Request:', error.request)
      }
      throw this.handleError(error)
    }
  }

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

  async completeInterview(sessionId: number): Promise<void> {
    try {
      await this.apiClient.post(`/interviews/${sessionId}/complete/`)
    } catch (error) {
      console.error('Error completing interview:', error)
      throw this.handleError(error)
    }
  }

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
}

export const interviewService = new InterviewService()
