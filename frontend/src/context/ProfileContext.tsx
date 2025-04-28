import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { UserProfile, UpdateProfileData } from '../types/profile'
import { profileService } from '../services/profileService'

interface ProfileContextType {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  fetchProfile: () => Promise<void>
  updateProfile: (data: UpdateProfileData) => Promise<UserProfile>
  clearError: () => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleError = useCallback((error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred'
    setError(message)
    throw error
  }, [])

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

  const value = {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    clearError,
  }

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  )
}

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
