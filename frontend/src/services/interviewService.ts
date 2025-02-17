import axios from 'axios'
import {
  InterviewQuestion,
  UserResponse,
  InterviewFeedback,
  InterviewSession,
  PastInterview,
} from '../types/interview'

class InterviewService {
  private apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  async getNextQuestion(): Promise<InterviewQuestion> {
    try {
      const response = await this.apiClient.get('/interviews/questions/next')
      return response.data
    } catch (error) {
      console.error('Error fetching next question:', error)
      throw error
    }
  }

  async startInterview(): Promise<InterviewSession> {
    try {
      const response = await this.apiClient.post('/interviews/start')
      return response.data
    } catch (error) {
      console.error('Error starting interview:', error)
      throw error
    }
  }

  async submitResponse(
    sessionId: number,
    response: UserResponse
  ): Promise<InterviewFeedback> {
    try {
      const apiResponse = await this.apiClient.post(
        `/interviews/${sessionId}/submit`,
        response
      )
      return apiResponse.data
    } catch (error) {
      console.error('Error submitting response:', error)
      throw error
    }
  }

  async completeInterview(sessionId: number): Promise<void> {
    try {
      await this.apiClient.post(`/interviews/${sessionId}/complete`)
    } catch (error) {
      console.error('Error completing interview:', error)
      throw error
    }
  }

  async getPastInterviews(page = 1, limit = 10): Promise<PastInterview[]> {
    try {
      const response = await this.apiClient.get('/interviews/history', {
        params: { page, limit },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching past interviews:', error)
      throw error
    }
  }

  async transcribeAudio(audioFile: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('audio', audioFile)

      const response = await this.apiClient.post(
        '/interviews/transcribe',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      return response.data.transcription
    } catch (error) {
      console.error('Error transcribing audio:', error)
      throw error
    }
  }
}

export const interviewService = new InterviewService()
