'use client'

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/button'

const Dashboard = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleSignOut = () => {
    logout()
    navigate('/signin')
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome to CareerCracker</h1>
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="hover:bg-red-50 hover:text-red-600"
        >
          Sign Out
        </Button>
      </div>
    </div>
  )
}

export default Dashboard
