import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { useInterview } from '@/context/InterviewContext'
import { formatDistanceToNow } from 'date-fns'
import styles from '@/styles/interview.module.css'
import InterviewReviewModal from '@/components/interview/InterviewReviewModal'
import InterviewModal from '@/components/interview/ActiveInterviewModal'
import InterviewFeedbackModal from '@/components/interview/InterviewFeedbackModal'
import { Loader2 } from 'lucide-react'
import { PastInterview } from '@/types/interview'

const InterviewStart: React.FC = () => {
  const {
    startInterview,
    pastInterviews = [],
    fetchPastInterviews,
    isLoading,
    error,
    submitFeedback,
    totalInterviews,
  } = useInterview()

  const [selectedInterviewId, setSelectedInterviewId] = useState<number | null>(
    null
  )
  const [isNewInterviewOpen, setIsNewInterviewOpen] = useState(false)
  const [isStartingInterview, setIsStartingInterview] = useState(false)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [feedbackInterviewId, setFeedbackInterviewId] = useState<number | null>(
    null
  )

  const [currentPage, setCurrentPage] = useState(1)
  const limit = 12

  useEffect(() => {
    const loadInterviews = async () => {
      try {
        await fetchPastInterviews(currentPage, limit)
      } catch (error) {
        throw error
      }
    }
    loadInterviews()
  }, [fetchPastInterviews, currentPage])

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
    fetchPastInterviews(currentPage, limit).catch(console.error)
  }, [fetchPastInterviews, currentPage])

  const handleOpenFeedbackModal = useCallback((interviewId: number) => {
    setFeedbackInterviewId(interviewId)
    setIsFeedbackModalOpen(true)
  }, [])

  const handleCloseFeedbackModal = useCallback(() => {
    setIsFeedbackModalOpen(false)
    setFeedbackInterviewId(null)
  }, [])

  const handleSubmitFeedback = useCallback(
    async (feedback: { content: string; rating: number }) => {
      if (!feedbackInterviewId) return

      try {
        await submitFeedback(
          feedbackInterviewId,
          feedback.content,
          feedback.rating
        )
        setIsFeedbackModalOpen(false)
        await fetchPastInterviews(currentPage, limit)
      } catch (error) {
        throw error
      }
    },
    [feedbackInterviewId, submitFeedback, fetchPastInterviews, currentPage]
  )

  const renderInterviewCard = (interview: PastInterview, index: number) => {
    if (!interview) return null

    const answers = Array.isArray(interview.answers) ? interview.answers : []
    const lastAnswer = answers.length > 0 ? answers[answers.length - 1] : null
    const isCompleted = interview.status === 'COMPLETED'
    const hasFeedback = !!interview.feedback

    return (
      <Card
        key={interview.id}
        className={styles.interviewCard}
        style={{ '--index': index } as React.CSSProperties}
      >
        <CardHeader className="relative">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <h3 className={`text-xl font-semibold ${styles.cardTitle}`}>
                Interview #{interview.id}
              </h3>
            </div>
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
              {interview.feedback && (
                <div
                  className={`flex justify-between text-sm text-muted-foreground ${styles.ratingInfo}`}
                >
                  <span className="font-semibold">Rating:</span>
                  <span>{interview.feedback.rating}/5</span>
                </div>
              )}
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

        <CardFooter className="flex gap-3">
          <Button
            className={`flex-1 ${styles.reviewButton}`}
            onClick={() => handleReviewInterview(interview.id)}
          >
            Review Interview
          </Button>
        </CardFooter>

        {isCompleted && !hasFeedback && (
          <button
            className={styles.feedbackSmallButton}
            onClick={() => handleOpenFeedbackModal(interview.id)}
          >
            Give Feedback
          </button>
        )}
      </Card>
    )
  }

  const totalPages = Math.max(1, Math.ceil(totalInterviews / limit))

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
            <span className="flex items-center gap-2">Starting...</span>
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

      <div className={styles.paginationControls}>
        <Button
          className={styles.paginationButton}
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </Button>

        <Button
          className={styles.paginationButton}
          disabled={totalPages <= 1 || currentPage >= totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </Button>
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
        onInterviewComplete={(interviewId) => {
          setIsNewInterviewOpen(false)
          setFeedbackInterviewId(interviewId)
          setIsFeedbackModalOpen(true)
        }}
      />

      {feedbackInterviewId !== null && (
        <InterviewFeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={handleCloseFeedbackModal}
          interviewId={feedbackInterviewId}
          onSubmit={handleSubmitFeedback}
        />
      )}
    </div>
  )
}

export default InterviewStart
