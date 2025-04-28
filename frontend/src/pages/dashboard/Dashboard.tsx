import React, { useEffect } from 'react'
import { useProfile } from '@/context/ProfileContext'

const Dashboard = () => {
  const { profile, fetchProfile, isLoading } = useProfile()

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {profile ? (
        <h1>Welcome back, {profile.username}!</h1>
      ) : (
        <h1>Welcome to Dashboard</h1>
      )}
    </div>
  )
}

export default Dashboard
