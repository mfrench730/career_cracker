import axios, { AxiosError } from 'axios'
import { UserProfile, UpdateProfileData } from '../types/profile'

class ProfileService {
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

  async fetchProfile(): Promise<UserProfile> {
    try {
      const response = await this.apiClient.get<UserProfile>(
        '/accounts/profile/'
      )
      return response.data
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw this.handleError(error)
    }
  }

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    try {
      const response = await this.apiClient.put<UserProfile>(
        '/accounts/profile/',
        data
      )
      return response.data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw this.handleError(error)
    }
  }
}

export const profileService = new ProfileService()
