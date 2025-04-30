'use client'

import type React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    major: '',
    educationLevel: '',
    experienceLevel: '',
    preferredInterviewTypes: [] as string[],
    preferredLanguage: '',
    resume: null as File | null,
    targetJobTitle: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredInterviewTypes: prev.preferredInterviewTypes.includes(value)
        ? prev.preferredInterviewTypes.filter((type) => type !== value)
        : [...prev.preferredInterviewTypes, value],
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file && file.size > 5 * 1024 * 1024) {
      setError('File size should not exceed 5MB')
      return
    }
    setFormData((prev) => ({ ...prev, resume: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('full_name', formData.fullName)
      formDataToSend.append('username', formData.username)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('password', formData.password)
      formDataToSend.append('major', formData.major)
      formDataToSend.append('education_level', formData.educationLevel)
      formDataToSend.append('experience_level', formData.experienceLevel)
      formData.preferredInterviewTypes.forEach((type) => {
        formDataToSend.append('preferred_interview_type', type)
      })
      formDataToSend.append('preferred_language', formData.preferredLanguage)
      formDataToSend.append('target_job_title', formData.targetJobTitle)
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume)
      }

      const response = await fetch(
        'http://localhost:8000/api/accounts/signup/',
        {
          method: 'POST',
          body: formDataToSend,
        }
      )

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        login()
        navigate('/dashboard')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'An error occurred during sign up')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Sign Up</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="form">
          {/* Existing Fields */}
          <div className="form-group">
            <label htmlFor="fullName" className="label">Full Name</label>
            <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="username" className="label">Username</label>
            <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="label">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="label">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required minLength={8} />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="label">Confirm Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          </div>

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

          {/* Preferred Interview Type */}
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
          
          {/* Job title input box*/}
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

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <p className="footer-text">
          Already have an account?{' '}
          <Link to="/signin">Sign In</Link>
        </p>
      </div>
    </div>
  )
}

export default SignUp
