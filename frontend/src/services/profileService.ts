// Import axios for making HTTP requests and AxiosError for error typing
import axios, { AxiosError } from 'axios'
// Import types for user profile and profile update payload
import { UserProfile, UpdateProfileData } from '../types/profile'

// Service class to manage API interactions related to user profiles
class ProfileService {
  // Axios instance configured for authenticated API access
  private apiClient = axios.create({
    baseURL: '/api', // Base URL for all profile-related API endpoints
    headers: {
      'Content-Type': 'application/json', // Ensure JSON is used for requests
    },
    withCredentials: true, // Include cookies (e.g., for CSRF)
  })

  constructor() {
    // Request interceptor to attach JWT token to all requests
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token') // Get token from local storage
        if (token) {
          config.headers.Authorization = `Bearer ${token}` // Add token to Authorization header
        }
        return config
      },
      (error) => Promise.reject(error) // Forward error if request setup fails
    )
  }

  // Handles and standardizes error responses from the API
  private handleError(error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{
        error?: string
        detail?: string
      }>
      // Prefer server-provided error message if available
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
    throw new Error('An unexpected error occurred') // Fallback for unknown errors
  }

  // Fetch the current user's profile data
  async fetchProfile(): Promise<UserProfile> {
    try {
      const response = await this.apiClient.get<UserProfile>(
        '/accounts/profile/'
      )
      return response.data // Return the fetched profile
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw this.handleError(error)
    }
  }

  // Update the user's profile with provided data
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    try {
      const response = await this.apiClient.put<UserProfile>(
        '/accounts/profile/',
        data // Send updated profile fields
      )
      return response.data // Return the updated profile
    } catch (error) {
      console.error('Error updating profile:', error)
      throw this.handleError(error)
    }
  }
}

// Export a singleton instance of the service for use across the app
export const profileService = new ProfileService()
