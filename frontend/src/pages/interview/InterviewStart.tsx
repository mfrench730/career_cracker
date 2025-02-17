import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { useInterview } from '../../context/InterviewContext'
import { formatDistanceToNow } from 'date-fns'
import styles from '@/styles/interview.module.css'
import InterviewReviewModal from '../../components/interview/InterviewReviewModal'
import InterviewModal from '../../components/interview/ActiveInterviewModal'

const InterviewStart: React.FC = () => {
  const { startInterview } = useInterview()
  const [selectedInterviewId, setSelectedInterviewId] = useState<number | null>(
    null
  )
  const [isNewInterviewOpen, setIsNewInterviewOpen] = useState(false)
  const [loading, setLoading] = useState<number | null>(null)

  // Mock data - replace with your actual data structure
  const [recentInterviews] = useState([
    {
      id: 1,
      question: 'Tell me about a challenging project',
      totalQuestions: 5,
      completedQuestions: 3,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      isCompleted: true,
    },
    {
      id: 2,
      question: 'Describe your experience with Team Leadership',
      totalQuestions: 5,
      completedQuestions: 5,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      isCompleted: true,
    },
    {
      id: 3,
      question: 'Tell me about a challenging project',
      totalQuestions: 5,
      completedQuestions: 3,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      isCompleted: true,
    },
    {
      id: 4,
      question: 'Describe your experience with Team Leadership',
      totalQuestions: 5,
      completedQuestions: 5,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      isCompleted: true,
    },
  ])

  // Debug log for selectedInterviewId changes
  React.useEffect(() => {
    console.log('Selected Interview ID changed:', selectedInterviewId)
  }, [selectedInterviewId])

  const handleReviewInterview = useCallback((interviewId: number) => {
    setLoading(interviewId)
    setSelectedInterviewId(interviewId)
    setLoading(null)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedInterviewId(null)
  }, [])

  const handleStartInterview = useCallback(() => {
    setIsNewInterviewOpen(true)
  }, [])

  const handleCloseNewInterview = useCallback(() => {
    setIsNewInterviewOpen(false)
  }, [])

  return (
    <div className={`space-y-4 ${styles.interviewContainer}`}>
      <div
        className={`flex justify-between items-center mb-6 ${styles.header}`}
      >
        <div>
          <h2 className={`text-2xl font-bold ${styles.pageTitle}`}>
            Interview Practice
          </h2>
          <p className={`text-muted-foreground ${styles.pageSubtitle}`}>
            Review past interviews and start new ones
          </p>
        </div>
        <Button onClick={handleStartInterview} className={styles.headerButton}>
          Begin New Interview
        </Button>
      </div>

      <div
        className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${styles.interviewGrid}`}
      >
        {recentInterviews.map((interview, index) => (
          <Card
            key={interview.id}
            className={styles.interviewCard}
            style={{ '--index': index } as React.CSSProperties}
          >
            <CardHeader className="card-header">
              <div className="flex justify-between items-start">
                <CardTitle className={`text-xl ${styles.cardTitle}`}>
                  Interview #{interview.id}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="card-content">
              <div className="space-y-4">
                <div>
                  <div
                    className={`flex justify-between text-sm text-muted-foreground ${styles.progressInfo}`}
                  >
                    <span className="font-semibold">Progress:</span>
                    <span>
                      {interview.completedQuestions} /{' '}
                      {interview.totalQuestions} questions
                    </span>
                  </div>
                  <div
                    className={`flex justify-between text-sm text-muted-foreground ${styles.timeInfo}`}
                  >
                    <span className="font-semibold">Completed:</span>
                    <span>
                      {formatDistanceToNow(new Date(interview.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Last Question:</p>
                  <p className={`text-muted-foreground ${styles.lastQuestion}`}>
                    {interview.question}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="card-footer">
              <Button
                className={`w-full ${styles.reviewButton}`}
                onClick={() => handleReviewInterview(interview.id)}
                disabled={loading === interview.id}
              >
                {loading === interview.id ? (
                  <span className="flex items-center">
                    <div className="animate-spin mr-2">●</div>
                    Loading...
                  </span>
                ) : (
                  'Review Interview'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <InterviewReviewModal
        isOpen={selectedInterviewId !== null}
        onClose={handleCloseModal}
        interviewId={selectedInterviewId ?? 0}
      />

      <InterviewModal
        isOpen={isNewInterviewOpen}
        onClose={handleCloseNewInterview}
      />
    </div>
  )
}

export default InterviewStart
