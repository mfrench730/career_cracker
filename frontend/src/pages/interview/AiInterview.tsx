import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { InterviewProvider } from '../../context/InterviewContext'
import InterviewStart from './InterviewStart'

const AiInterview: React.FC = () => {
  const location = useLocation()

  useEffect(() => {
    console.log('AiInterview component mounted')
    console.log('Current location:', location)
  }, [location])

  return (
    <InterviewProvider>
      <Routes>
        <Route path="" element={<InterviewStart />} />
      </Routes>
    </InterviewProvider>
  )
}

export default AiInterview
