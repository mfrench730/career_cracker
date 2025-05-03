'use client' // Enables client-side rendering in Next.js

import type React from 'react'
import { useState } from 'react' // For managing local component state
import { Link, useNavigate } from 'react-router-dom' // Routing utilities
import { useAuth } from '../../context/AuthContext' // Custom auth context

// SignUp component definition
const SignUp: React.FC = () => {
  // State to manage form data for each input field
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    major: '',
    educationLevel: '',
    experienceLevel: '',
    preferredInterviewTypes: [] as string[], // Multiple checkbox values
    preferredLanguage: '',
    resume: null as File | null, // Uploaded resume file
    targetJobTitle: '',
  })

  const [loading, setLoading] = useState(false) // Loading state during submission
  const [error, setError] = useState('') // Error message to display to user
  const navigate = useNavigate() // For redirecting after successful signup
  const { login } = useAuth() // Auth context to log in user after sign up

  // Handle input change for text fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value })) // Update relevant field in formData
  }

  // Handle change for select dropdowns
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value })) // Update relevant select field
  }

  // Handle toggling of interview type checkboxes
  const handleCheckboxChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredInterviewTypes: prev.preferredInterviewTypes.includes(value)
        ? prev.preferredInterviewTypes.filter((type) => type !== value) // Remove if already selected
        : [...prev.preferredInterviewTypes, value], // Add if not selected
    }))
  }

  // Handle file input for resume upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file && file.size > 5 * 1024 * 1024) {
      setError('File size should not exceed 5MB') // Check file size
      return
    }
    setFormData((prev) => ({ ...prev, resume: file })) // Set resume file
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent default form behavior
    setLoading(true) // Show loading spinner
    setError('') // Clear existing errors

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match') // Show password mismatch error
      setLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData() // Create form data for file upload
      formDataToSend.append('full_name', formData.fullName)
      formDataToSend.append('username', formData.username)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('password', formData.password)
      formDataToSend.append('major', formData.major)
      formDataToSend.append('education_level', formData.educationLevel)
      formDataToSend.append('experience_level', formData.experienceLevel)
      formData.preferredInterviewTypes.forEach((type) => {
        formDataToSend.append('preferred_interview_type', type) // Append each selected interview type
      })
      formDataToSend.append('preferred_language', formData.preferredLanguage)
      formDataToSend.append('target_job_title', formData.targetJobTitle)
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume) // Append resume if provided
      }

      // Send POST request to signup endpoint
      const response = await fetch(
        'http://localhost:8000/api/accounts/signup/',
        {
          method: 'POST',
          body: formDataToSend,
        }
      )

      // If response is OK, log in and redirect
      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token) // Store token
        login() // Update auth context
        navigate('/dashboard') // Redirect user
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'An error occurred during sign up') // Show API error
      }
    } catch (err) {
      setError('An error occurred. Please try again.') // Catch network or server errors
    } finally {
      setLoading(false) // Reset loading state
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Sign Up</h1>
        {/* Show error message if exists */}
        {error && <p className="error-message">{error}</p>}
        {/* Signup form starts */}
        <form onSubmit={handleSubmit} className="form">
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="fullName" className="label">Full Name</label>
            <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
          </div>

          {/* Username */}
          <div className="form-group">
            <label htmlFor="username" className="label">Username</label>
            <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="label">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="label">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required minLength={8} />
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="label">Confirm Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          {/* Major */}
          <div className="form-group">
            <label className="label">Major</label>
            <select name="major" className="select" onChange={handleSelectChange} required>
              <option value="">Select Major</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Business">Business</option>
            </select>
          </div>

          {/* Education Level */}
          <div className="form-group">
            <label className="label">Current Education Level</label>
            <select name="educationLevel" className="select" onChange={handleSelectChange} required>
              <option value="">Select Education Level</option>
              <option value="High School">High School</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Graduate">Graduate</option>
              <option value="PhD">PhD</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Experience Level */}
          <div className="form-group">
            <label className="label">Experience Level</label>
            <select name="experienceLevel" className="select" onChange={handleSelectChange} required>
              <option value="">Select Experience Level</option>
              <option value="No Experience">No Experience</option>
              <option value="Entry-Level">Entry-Level</option>
              <option value="1-3 Years">1-3 Years</option>
              <option value="3+ Years">3+ Years</option>
            </select>
          </div>

          {/* Preferred Interview Types */}
          <div className="form-group">
            <label className="label">Preferred Interview Type</label>
            <div className="checkbox-group">
              {['Behavioral', 'Technical', 'System Design', 'Case Study'].map((type) => (
                <div key={type} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`interview-${type}`}
                    checked={formData.preferredInterviewTypes.includes(type)}
                    onChange={() => handleCheckboxChange(type)}
                  />
                  <label htmlFor={`interview-${type}`} className="checkbox-label">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Preferred Programming Language */}
          <div className="form-group">
            <label className="label">Preferred Programming Language</label>
            <select name="preferredLanguage" className="select" onChange={handleSelectChange} required>
              <option value="">Select Language</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="C++">C++</option>
              <option value="JavaScript">JavaScript</option>
            </select>
          </div>
          
          {/* Target Job Title */}
          <div className="form-group">
            <label htmlFor="targetJobTitle" className="label">Target Job Title</label>
            <input
              type="text"
              id="targetJobTitle"
              name="targetJobTitle"
              value={formData.targetJobTitle}
              onChange={handleChange}
              required
            />
          </div>

          {/* Resume Upload */}
          <div className="form-group">
            <label htmlFor="resume" className="label">Upload Resume (Optional)</label>
            <input type="file" id="resume" name="resume" onChange={handleFileChange} accept=".pdf,.docx" />
            <p className="small-text">Max file size: 5MB</p>
          </div>

          {/* Submit button */}
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        {/* Redirect to sign in page */}
        <p className="footer-text">
          Already have an account?{' '}
          <Link to="/signin">Sign In</Link>
        </p>
      </div>
    </div>
  )
}

export default SignUp // Export the component
