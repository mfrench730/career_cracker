import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import InterviewStart from '../pages/interview/InterviewStart'

// Defines routing for the interview section of the app
const InterviewRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="start" element={<InterviewStart />} />
      <Route path="*" element={<Navigate to="start" replace />} />
    </Routes>
  )
}

export default InterviewRoutes
