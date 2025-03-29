import React, { useState } from 'react'
import styles from '@/styles/job.module.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { jobService } from '@/services/jobService'
import { JobDescription } from '@/types/job'

const JobSearch: React.FC = () => {
  const [jobTitle, setJobTitle] = useState('')
  const [result, setResult] = useState<JobDescription | null>(null)

  const handleSearch = async () => {
    if (!jobTitle) return
    try {
      const data = await jobService.getCareerInfo(jobTitle)
      setResult(data)
    } catch (error) {
      console.error('Error fetching job info:', error)
    }
  }

  return (
    <div className={styles.jobContainer}>
      <div className={styles.header}>
        <Input
          type="text"
          placeholder="Enter a job title..."
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch()
            }
          }}
          className={styles.searchInput}
        />
        <Button onClick={handleSearch} className={styles.searchButton}>
          Search
        </Button>
      </div>

      {result && (
        <div className={styles.resultBox}>
          <h2>Description</h2>
          <p>{result.description}</p>

          <h2>Tasks</h2>
          <ul>
            {result.tasks.map((task, index) => (
              <li key={index}>{task}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default JobSearch
