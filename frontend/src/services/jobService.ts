// Import axios for HTTP requests and AxiosError for detailed error handling
import axios, { AxiosError } from 'axios'
// Import the JobDescription type to define the shape of the API response
import { JobDescription } from '../types/job'

// Service class to handle job-related API requests
class JobService {

  // Create and configure an Axios instance for making requests
  private apiClient = axios.create({
    baseURL: '/api', // Base path for all API requests
    headers: {
      'Content-Type': 'application/json', // Ensure JSON payloads
    },
    withCredentials: true, // Include credentials like cookies if needed
  })

  constructor() {
    // Attach an interceptor to automatically include the JWT token in requests
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token') // Retrieve token from local storage
        if (token) {
          config.headers.Authorization = `Bearer ${token}` // Add token to Authorization header
        }
        return config
      },
      (error) => Promise.reject(error) // Forward any request errors
    )
  }

  // Centralized error handler for all API calls
  private handleError(error: unknown) {
    if (axios.isAxiosError(error)) {
      // Extract custom error message from server response if available
      const axiosError = error as AxiosError<{ error?: string; detail?: string }>
      const message =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.detail ||
        axiosError.message
      console.error('Job API Error:', message)
      throw new Error(message) // Throw the formatted error
    }
    throw new Error('Unexpected error occurred') // Handle non-Axios errors
  }

  // Fetch job-related data (description, tasks, etc.) for a given job title
  async getCareerInfo(jobTitle: string): Promise<JobDescription> {
    try {
      const response = await this.apiClient.get<JobDescription>(
        `/jobs/career_info/`,
        {
          params: { job_title: jobTitle }, // Pass jobTitle as query param
        }
      )
      return response.data // Return the job info data
    } catch (error) {
      throw this.handleError(error) // Use central error handler
    }
  }
}

// Export a single instance of the service for reuse across the app
export const jobService = new JobService()
