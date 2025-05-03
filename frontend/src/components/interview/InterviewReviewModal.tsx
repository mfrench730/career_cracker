import React from 'react'
// Utility to format dates nicely
import { format } from 'date-fns'
// Icons used throughout the UI
import { X, MessageSquare, User, ThumbsUp, ThumbsDown } from 'lucide-react'
// Styling for the modal
import styles from '@/styles/interviewReviewModal.module.css'
// Custom hook to access interview-related data
import { useInterview } from '@/context/InterviewContext'
// Type definition for a past interview
import { PastInterview } from '@/types/interview'

// Props that this modal expects
interface InterviewReviewModalProps {
  isOpen: boolean // Whether the modal is currently open
  onClose: () => void // Function to close the modal
  interviewId: number // The ID of the interview we want to review
}

// Main component to show the full review of a past interview
const InterviewReviewModal: React.FC<InterviewReviewModalProps> = ({
  isOpen,
  onClose,
  interviewId,
}) => {
  // Get past interview data and state from context
  const { pastInterviews, fetchPastInterviews, isLoading, error } =
    useInterview()
  const [interviewData, setInterviewData] =
    React.useState<PastInterview | null>(null)

  // This useEffect runs when the modal is opened or the ID changes
  React.useEffect(() => {
    const fetchData = async () => {
      // Don’t fetch if modal isn’t open
      if (!isOpen) return

      try {
        // If we haven’t fetched interviews yet, fetch them first
        if (pastInterviews.length === 0) {
          await fetchPastInterviews()
        }

        // Find the interview that matches the given ID
        const interview = pastInterviews.find((i) => i.id === interviewId)

        // Save the interview data to state if found
        if (interview) {
          setInterviewData(interview)
        }
      } catch (err) {
        console.error('Error fetching interview data:', err)
      }
    }

    fetchData()
  }, [isOpen, interviewId, pastInterviews, fetchPastInterviews])

  // Don’t render anything if the modal isn’t open
  if (!isOpen) return null

  return (
    <>
      {/* Background overlay that closes modal when clicked */}
      <div className={styles.modalOverlay} onClick={onClose} />

      {/* Modal container (clicking inside doesn’t close it) */}
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Interview Review #{interviewId}</h2>
          {/* Show the date if we have data */}
          {interviewData && (
            <p className={styles.modalDescription}>
              Conducted on {format(new Date(interviewData.start_time), 'PPP')}
            </p>
          )}
          {/* Close button */}
          <button className={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {isLoading ? (
            // Loading indicator while fetching
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin mr-2">●</div>
              <span>Loading interview data...</span>
            </div>
          ) : error ? (
            // Show error if fetching failed
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : !interviewData ? (
            // Handle case where interview ID is invalid
            <div className="text-center p-4">Interview not found</div>
          ) : (
            // Main content when interview data is available
            <div className="space-y-6">
              {/* Loop through each question/response in the interview */}
              {interviewData.answers.map((answer, index) => (
                <div key={index} className={styles.questionCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Question {index + 1}</h3>
                    {/* Show thumbs up/down if user rated the question */}
                    {answer.rating && (
                      <div
                        className={
                          answer.rating.rating === 'LIKE'
                            ? styles.likeIndicator
                            : styles.dislikeIndicator
                        }
                      >
                        {answer.rating.rating === 'LIKE' ? (
                          <>
                            <ThumbsUp
                              size={16}
                              className={styles.ratingThumbIcon}
                            />
                            <span>Helpful</span>
                          </>
                        ) : (
                          <>
                            <ThumbsDown
                              size={16}
                              className={styles.ratingThumbIcon}
                            />
                            <span>Not Helpful</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Display the original question */}
                  <div className={styles.questionSection}>
                    <h4 className={styles.sectionTitle}>
                      <MessageSquare className={styles.sectionIcon} size={18} />
                      Question
                    </h4>
                    <p className={styles.sectionContent}>
                      {answer.question_text}
                    </p>
                  </div>

                  {/* Display the user's response */}
                  <div className={styles.questionSection}>
                    <h4 className={styles.sectionTitle}>
                      <User className={styles.sectionIcon} size={18} />
                      Your Response
                    </h4>
                    <p className={styles.sectionContent}>
                      {answer.user_response}
                    </p>
                  </div>

                  {/* Show AI-generated feedback */}
                  <div className={styles.questionSection}>
                    <h4 className={styles.sectionTitle}>
                      <ThumbsUp className={styles.sectionIcon} size={18} />
                      AI Feedback
                    </h4>
                    <p className={styles.sectionContent}>
                      {answer.ai_feedback}
                    </p>

                    {/* Show the user’s rating for the feedback again */}
                    {answer.rating && (
                      <div className={styles.feedbackRating}>
                        <span className={styles.feedbackRatingLabel}>
                          Your rating:
                        </span>
                        <div
                          className={
                            answer.rating.rating === 'LIKE'
                              ? styles.likeIndicator
                              : styles.dislikeIndicator
                          }
                        >
                          {answer.rating.rating === 'LIKE' ? (
                            <>
                              <ThumbsUp
                                size={14}
                                className={styles.ratingThumbIcon}
                              />
                              <span>Helpful</span>
                            </>
                          ) : (
                            <>
                              <ThumbsDown
                                size={14}
                                className={styles.ratingThumbIcon}
                              />
                              <span>Not Helpful</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* If the user submitted final feedback, show it here */}
              {interviewData.feedback && (
                <div className={styles.feedbackSection}>
                  <h3 className={styles.feedbackTitle}>Your Feedback</h3>
                  <div className={styles.feedbackCard}>
                    {/* Show star rating out of 5 */}
                    <div className={styles.feedbackRatingStars}>
                      <p className={styles.ratingLabel}>Overall Rating:</p>
                      <div className={styles.starRating}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`${styles.star} ${
                              i < (interviewData.feedback?.rating || 0)
                                ? styles.starActive
                                : ''
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Display written feedback */}
                    <p className={styles.feedbackContent}>
                      {interviewData.feedback.content}
                    </p>

                    {/* Show when the feedback was submitted */}
                    <p className={styles.feedbackDate}>
                      Submitted on{' '}
                      {format(
                        new Date(interviewData.feedback.created_at),
                        'PPP'
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default InterviewReviewModal
