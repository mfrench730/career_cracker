import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { UserProfile, UpdateProfileData } from '../types/profile'
import { profileService } from '../services/profileService'

// Define the shape of the context value
interface ProfileContextType {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  fetchProfile: () => Promise<void>
  updateProfile: (data: UpdateProfileData) => Promise<UserProfile>
  clearError: () => void
}

// Create the context object
const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

// Context provider component
export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Clear any error messages
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Generic error handler
  const handleError = useCallback((error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred'
    setError(message)
    throw error
  }, [])

  // Fetch profile from API
  const fetchProfile = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const profileData = await profileService.fetchProfile()
      setProfile(profileData)
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Update profile data via API
  const updateProfile = useCallback(
    async (data: UpdateProfileData): Promise<UserProfile> => {
      setIsLoading(true)
      setError(null)
      try {
        const updatedProfile = await profileService.updateProfile(data)
        setProfile(updatedProfile)
        return updatedProfile
      } catch (error) {
        handleError(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [handleError]
  )

  // Value to be shared via context
  const value = {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    clearError,
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

// Hook to access profile context
export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
