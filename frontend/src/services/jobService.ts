import axios, { AxiosError } from 'axios'
import { JobDescription } from '../types/job'

// Service class to handle job-related API requests
class JobService {

  // Create a configured Axios instance
  private apiClient = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  })

  constructor() {

    // Add interceptor to include JWT token in requests
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

  // Handle and format API errors
  private handleError(error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string; detail?: string }>
      const message = axiosError.response?.data?.error || axiosError.response?.data?.detail || axiosError.message
      console.error('Job API Error:', message)
      throw new Error(message)
    }
    throw new Error('Unexpected error occurred')
  }

  // Fetch job description and tasks by job title
  async getCareerInfo(jobTitle: string): Promise<JobDescription> {
    try {
      const response = await this.apiClient.get<JobDescription>(
        `/jobs/career_info/`,
        { params: { job_title: jobTitle } }
      )
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }
}

// Export a single instance of the service
export const jobService = new JobService()
