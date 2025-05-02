import React, { createContext, useContext, useState, useEffect } from 'react'

// Define the shape of the authentication context
interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: () => void
  logout: () => void
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// AuthProvider wraps the app and provides auth state and functions
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if token exists in local storage on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          // If token exists, set user as authenticated
          setIsAuthenticated(true)
        } catch {
          // If error occurs (e.g., malformed token), remove token
          localStorage.removeItem('token')
          setIsAuthenticated(false)
        }
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  // Set user as authenticated
  const login = () => {
    setIsAuthenticated(true)
  }

  // Remove token and mark user as not authenticated
  const logout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
  }

  // Provide the auth state and methods to children
  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
