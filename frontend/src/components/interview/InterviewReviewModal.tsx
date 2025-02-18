import React from 'react'
import { format } from 'date-fns'
import { X, MessageSquare, User, ThumbsUp } from 'lucide-react'
import styles from '@/styles/interviewReviewModal.module.css'
import { useInterview } from '@/context/InterviewContext'
import { PastInterview } from '@/types/interview'

interface InterviewReviewModalProps {
  isOpen: boolean
  onClose: () => void
  interviewId: number
}

const InterviewReviewModal: React.FC<InterviewReviewModalProps> = ({
  isOpen,
  onClose,
  interviewId,
}) => {
  const { pastInterviews, fetchPastInterviews, isLoading, error } =
    useInterview()
  const [interviewData, setInterviewData] =
    React.useState<PastInterview | null>(null)

  React.useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return

      try {
        if (pastInterviews.length === 0) {
          await fetchPastInterviews()
        }

        const interview = pastInterviews.find((i) => i.id === interviewId)

        if (interview) {
          setInterviewData(interview)
        }
      } catch (err) {
        console.error('Error fetching interview data:', err)
      }
    }

    fetchData()
  }, [isOpen, interviewId, pastInterviews, fetchPastInterviews])

  if (!isOpen) return null

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose} />
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Interview Review #{interviewId}</h2>
          {interviewData && (
            <p className={styles.modalDescription}>
              Conducted on {format(new Date(interviewData.start_time), 'PPP')}
            </p>
          )}
          <button className={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin mr-2">●</div>
              <span>Loading interview data...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : !interviewData ? (
            <div className="text-center p-4">Interview not found</div>
          ) : (
            <div className="space-y-6">
              {interviewData.answers.map((answer, index) => (
                <div key={index} className={styles.questionCard}>
                  <h3 className={styles.cardTitle}>Question {index + 1}</h3>

                  <div className={styles.questionSection}>
                    <h4 className={styles.sectionTitle}>
                      <MessageSquare className={styles.sectionIcon} size={18} />
                      Question
                    </h4>
                    <p className={styles.sectionContent}>
                      {answer.question_text}
                    </p>
                  </div>

                  <div className={styles.questionSection}>
                    <h4 className={styles.sectionTitle}>
                      <User className={styles.sectionIcon} size={18} />
                      Your Response
                    </h4>
                    <p className={styles.sectionContent}>
                      {answer.user_response}
                    </p>
                  </div>

                  <div className={styles.questionSection}>
                    <h4 className={styles.sectionTitle}>
                      <ThumbsUp className={styles.sectionIcon} size={18} />
                      AI Feedback
                    </h4>
                    <p className={styles.sectionContent}>
                      {answer.ai_feedback}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default InterviewReviewModal
