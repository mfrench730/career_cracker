'use client'

import type React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import { useAuth } from '../../context/AuthContext'
import '../../styles/signUpIn.css';

const SignIn: React.FC = () => {
  // State hooks for form inputs
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        'http://localhost:8000/api/accounts/login/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || 'Invalid username or password')
        navigate('/signin')
        return
      }

      const data = await response.json()
      localStorage.setItem('token', data.token)
      login()
      navigate('/dashboard')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Sign In</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="form">
          {/* Username Input */}
          <div className="form-group">
            <label htmlFor="username" className="label">Username</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password" className="label">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {/* Remember me + forgot password */}
          <div className="form-group row">
            <div className="checkbox-group">
              <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
              <label htmlFor="remember-me" className="checkbox-label">Remember me</label>
            </div>
            <Link to="/forgot-password" className="link">Forgot Password?</Link>
          </div>
          {/* Submit Button */}
          <Button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
        {/* Navigation to Sign Up */}
        <p className="footer-text">
          Don't have an account? <Link to="/signup" className="link">Sign Up</Link>
        </p>
      </div>
    </div>
  )
}

export default SignIn
