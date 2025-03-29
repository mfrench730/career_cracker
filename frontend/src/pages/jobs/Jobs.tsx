import React from 'react'
import { Routes, Route } from 'react-router-dom'
import JobSearch from './JobSearch'

const JobSearchPage: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<JobSearch />} />
    </Routes>
  )
}

export default JobSearchPage
