import React from 'react'
import { Routes, Route } from 'react-router-dom'
import InterviewStart from './InterviewStart'

const AiInterview: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<InterviewStart />} />
    </Routes>
  )
}

export default AiInterview
