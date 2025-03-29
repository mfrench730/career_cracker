import axios, { AxiosError } from 'axios'
import { JobDescription } from '../types/job'

class JobService {
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
      (error) => Promise.reject(error)
    )
  }

  private handleError(error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string; detail?: string }>
      const message = axiosError.response?.data?.error || axiosError.response?.data?.detail || axiosError.message
      console.error('Job API Error:', message)
      throw new Error(message)
    }
    throw new Error('Unexpected error occurred')
  }

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

export const jobService = new JobService()
