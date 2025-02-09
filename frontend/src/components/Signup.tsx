import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface SignupProps {
  onSignupSuccess: () => void
}

const Signup: React.FC<SignupProps> = ({ onSignupSuccess }) => {
  const [username, setUsername] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      if (response.ok) {
        // Successful signup: update auth state and navigate to Home
        onSignupSuccess()
        navigate('/')
      } else {
        console.error('Signup failed:', data)
      }
    } catch (error) {
      console.error('Error signing up:', error)
    }
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Sign Up for CareerCracker</h2>
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
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          Sign Up
        </button>
      </form>
    </div>
  )
}

export default Signup
