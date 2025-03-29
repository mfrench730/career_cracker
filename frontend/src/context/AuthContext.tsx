import React, { createContext, useContext, useState, useEffect } from 'react'


interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: { name: string }, token: string) => void
  logout: () => void
  user: { name: string } | null
}
const [user, setUser] = useState<{ name: string } | null>(null)
const AuthContext = createContext<AuthContextType | undefined>(undefined)






export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          setIsAuthenticated(true)
        } catch {
          localStorage.removeItem('token')
          setIsAuthenticated(false)
        }
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])


  const login = (userData: { name: string }, token: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setIsAuthenticated(true)
    setUser(userData)
  }


  const logout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
  }


  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  )
}


export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


export default AuthContext



