import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface LoginProps {
  onLoginSuccess: () => void
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      if (response.ok) {
        // Successful login: update auth state and navigate to Home
        onLoginSuccess()
        navigate('/')
      } else {
        console.error('Login failed:', data)
      }
    } catch (error) {
      console.error('Error logging in:', error)
    }
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Login to CareerCracker</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ margin: '0.5rem' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ margin: '0.5rem' }}
        />
        <br />
        <button type="submit" style={{ margin: '0.5rem' }}>
          Login
        </button>
      </form>
    </div>
  )
}

export default Login
