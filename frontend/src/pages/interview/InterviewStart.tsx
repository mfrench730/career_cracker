import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { useInterview } from '@/context/InterviewContext'
import { formatDistanceToNow } from 'date-fns'
import styles from '@/styles/interview.module.css'
import InterviewReviewModal from '@/components/interview/InterviewReviewModal'
import InterviewModal from '@/components/interview/ActiveInterviewModal'
import { Loader2 } from 'lucide-react'
import { PastInterview } from '@/types/interview'

const InterviewStart: React.FC = () => {
  const {
    startInterview,
    pastInterviews = [], // Provide default empty array
    fetchPastInterviews,
    isLoading,
    error,
  } = useInterview()

  const [selectedInterviewId, setSelectedInterviewId] = useState<number | null>(
    null
  )
  const [isNewInterviewOpen, setIsNewInterviewOpen] = useState(false)
  const [isStartingInterview, setIsStartingInterview] = useState(false)

  // Fetch past interviews when component mounts
  useEffect(() => {
    const loadInterviews = async () => {
      try {
        await fetchPastInterviews()
      } catch (error) {
        console.error('Failed to fetch interviews:', error)
      }
    }
    loadInterviews()
  }, [fetchPastInterviews])

  const handleReviewInterview = useCallback((interviewId: number) => {
    setSelectedInterviewId(interviewId)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedInterviewId(null)
  }, [])

  const handleStartInterview = useCallback(async () => {
    setIsStartingInterview(true)
    try {
      await startInterview()
      setIsNewInterviewOpen(true)
    } catch (error) {
      console.error('Failed to start interview:', error)
    } finally {
      setIsStartingInterview(false)
    }
  }, [startInterview])

  const handleCloseNewInterview = useCallback(() => {
    setIsNewInterviewOpen(false)
    fetchPastInterviews().catch(console.error)
  }, [fetchPastInterviews])

  // Render interview card
  const renderInterviewCard = (interview: PastInterview, index: number) => {
    if (!interview) return null

    const answers = Array.isArray(interview.answers) ? interview.answers : []
    const lastAnswer = answers.length > 0 ? answers[answers.length - 1] : null

    return (
      <Card
        key={interview.id}
        className={styles.interviewCard}
        style={{ '--index': index } as React.CSSProperties}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className={`text-xl ${styles.cardTitle}`}>
              Interview #{interview.id}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div
                className={`flex justify-between text-sm text-muted-foreground ${styles.progressInfo}`}
              >
                <span className="font-semibold">Questions:</span>
                <span>{answers.length} answered</span>
              </div>
              <div
                className={`flex justify-between text-sm text-muted-foreground ${styles.timeInfo}`}
              >
                <span className="font-semibold">Completed:</span>
                <span>
                  {interview.end_time
                    ? formatDistanceToNow(new Date(interview.end_time), {
                        addSuffix: true,
                      })
                    : 'In progress'}
                </span>
              </div>
            </div>
            {lastAnswer && (
              <div className="text-sm">
                <p className="font-medium">Last Question:</p>
                <p className={`text-muted-foreground ${styles.lastQuestion}`}>
                  {lastAnswer.question_text}
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className={`w-full ${styles.reviewButton}`}
            onClick={() => handleReviewInterview(interview.id)}
          >
            Review Interview
          </Button>
        </CardFooter>
      </Card>
    )
  }

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
        <Button
          onClick={handleStartInterview}
          className={styles.headerButton}
          disabled={isStartingInterview}
        >
          {isStartingInterview ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting...
            </span>
          ) : (
            'Begin New Interview'
          )}
        </Button>
      </div>

      {error && (
        <div className="text-red-500 p-4 rounded bg-red-50">Error: {error}</div>
      )}

      <div
        className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${styles.interviewGrid}`}
      >
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading interviews...</p>
          </div>
        ) : !Array.isArray(pastInterviews) || pastInterviews.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            <p>No past interviews found. Start your first interview!</p>
          </div>
        ) : (
          pastInterviews.map((interview, index) =>
            renderInterviewCard(interview, index)
          )
        )}
      </div>

      {selectedInterviewId !== null && (
        <InterviewReviewModal
          isOpen={true}
          onClose={handleCloseModal}
          interviewId={selectedInterviewId}
        />
      )}

      <InterviewModal
        isOpen={isNewInterviewOpen}
        onClose={handleCloseNewInterview}
      />
    </div>
  )
}

export default InterviewStart
