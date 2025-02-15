"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select.tsx"
import { Checkbox } from "../../components/ui/checkbox"

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    major: "",
    educationLevel: "",
    experienceLevel: "",
    preferredInterviewTypes: [] as string[],
    preferredLanguage: "",
    resume: null as File | null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
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
      setError("File size should not exceed 5MB")
      return
    }
    setFormData((prev) => ({ ...prev, resume: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("full_name", formData.fullName)
      formDataToSend.append("username", formData.username)
      formDataToSend.append("email", formData.email)
      formDataToSend.append("password", formData.password)
      formDataToSend.append("major", formData.major)
      formDataToSend.append("education_level", formData.educationLevel)
      formDataToSend.append("experience_level", formData.experienceLevel)
      formData.preferredInterviewTypes.forEach((type) => {
        formDataToSend.append("preferred_interview_type", type)
      })
      formDataToSend.append("preferred_language", formData.preferredLanguage)
      if (formData.resume) {
        formDataToSend.append("resume", formData.resume)
      }

      const response = await fetch("http://localhost:8000/api/accounts/signup/", {
        method: "POST",
        body: formDataToSend,
      })

      if (response.ok) {
        const data = await response.json()
        // Store the token in localStorage or a secure cookie
        localStorage.setItem("authToken", data.token)
        navigate("/dashboard")
      } else {
        const errorData = await response.json()
        setError(errorData.message || "An error occurred during sign up")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <Input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              User Name
            </label>
            <Input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="major" className="block text-sm font-medium text-gray-700">
              Major
            </label>
            <Select onValueChange={(value) => handleSelectChange("major", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Major" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700">
              Current Education Level
            </label>
            <Select onValueChange={(value) => handleSelectChange("educationLevel", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Education Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High School">High School</SelectItem>
                <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                <SelectItem value="Graduate">Graduate</SelectItem>
                <SelectItem value="PhD">PhD</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700">
              Experience Level
            </label>
            <Select onValueChange={(value) => handleSelectChange("experienceLevel", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Experience Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No Experience">No Experience</SelectItem>
                <SelectItem value="Entry-Level">Entry-Level</SelectItem>
                <SelectItem value="1-3 Years">1-3 Years</SelectItem>
                <SelectItem value="3+ Years">3+ Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Preferred Interview Type</label>
            <div className="space-y-2">
              {["Behavioral", "Technical", "System Design", "Case Study"].map((type) => (
                <div key={type} className="flex items-center">
                  <Checkbox
                    id={`interview-${type}`}
                    checked={formData.preferredInterviewTypes.includes(type)}
                    onCheckedChange={() => handleCheckboxChange(type)}
                  />
                  <label htmlFor={`interview-${type}`} className="ml-2 text-sm text-gray-600">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-700">
              Preferred Programming Language
            </label>
            <Select onValueChange={(value) => handleSelectChange("preferredLanguage", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Language (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="Java">Java</SelectItem>
                <SelectItem value="C++">C++</SelectItem>
                <SelectItem value="JavaScript">JavaScript</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
              Upload Resume (Optional)
            </label>
            <Input type="file" id="resume" name="resume" onChange={handleFileChange} accept=".pdf,.docx" />
            <p className="mt-1 text-xs text-gray-500">Max file size: 5MB</p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignUp

