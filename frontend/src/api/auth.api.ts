// Define the expected response structure for auth endpoints
interface AuthResponse {
  token?: string
  error?: string
}

export const authApi = {
  // Sends login request to backend with username and password
  login: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(
        'http://localhost:8000/api/accounts/login/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        }
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }
      return data
    } catch (error) {
      throw error
    }
  },

  // Sends sign-up request to backend with required user fields
  signUp: async (
    username: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const response = await fetch(
        'http://localhost:8000/api/accounts/signup/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        }
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed')
      }
      return data
    } catch (error) {
      throw error
    }
  },
}
