import React from 'react'
import { format } from 'date-fns'
import { X, MessageSquare, User, ThumbsUp } from 'lucide-react'
import styles from '../../styles/interviewReviewModal.module.css'

interface InterviewQuestion {
  question: string
  response: string
  feedback: string
}

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
  const [interviewData, setInterviewData] = React.useState<{
    id: number
    date: string
    questions: InterviewQuestion[]
  } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchInterviewData = async () => {
      if (!isOpen) return

      setLoading(true)
      setError(null)

      try {
        const mockData = {
          id: interviewId,
          date: '2025-02-10T12:00:00Z',
          questions: [
            {
              question: 'Tell me about a challenging project you worked on',
              response:
                'I worked on a complex web application that required integrating multiple third-party APIs. The main challenge was ensuring data consistency across different systems while maintaining real-time updates.',
              feedback:
                'Good explanation of the technical challenge. Consider also mentioning the specific problem-solving approaches you used and the outcome of the project.',
            },
            {
              question: 'How do you handle conflicts in a team?',
              response:
                'I believe in addressing conflicts early through open communication. In my last role, I facilitated a discussion between team members who had different approaches to architecture decisions.',
              feedback:
                'Strong emphasis on communication. You could strengthen this by providing specific examples of the resolution process and lessons learned.',
            },
            {
              question: 'How do you handle conflicts in a team?',
              response:
                'I believe in addressing conflicts early through open communication. In my last role, I facilitated a discussion between team members who had different approaches to architecture decisions.',
              feedback:
                'Strong emphasis on communication. You could strengthen this by providing specific examples of the resolution process and lessons learned.',
            },
            {
              question: 'How do you handle conflicts in a team?',
              response:
                'I believe in addressing conflicts early through open communication. In my last role, I facilitated a discussion between team members who had different approaches to architecture decisions.',
              feedback:
                'Strong emphasis on communication. You could strengthen this by providing specific examples of the resolution process and lessons learned.',
            },
            {
              question: 'How do you handle conflicts in a team?',
              response:
                'I believe in addressing conflicts early through open communication. In my last role, I facilitated a discussion between team members who had different approaches to architecture decisions.',
              feedback:
                'Strong emphasis on communication. You could strengthen this by providing specific examples of the resolution process and lessons learned.',
            },
          ],
        }

        setInterviewData(mockData)
      } catch (err) {
        setError('Failed to load interview data. Please try again later.')
        console.error('Error fetching interview data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchInterviewData()
  }, [isOpen, interviewId])

  if (!isOpen) return null

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose} />
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Interview Review #{interviewId}</h2>
          {interviewData && (
            <p className={styles.modalDescription}>
              Conducted on {format(new Date(interviewData.date), 'PPP')}
            </p>
          )}
          <button className={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin mr-2">●</div>
              <span>Loading interview data...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : (
            <div className="space-y-6">
              {interviewData?.questions.map((q, index) => (
                <div key={index} className={styles.questionCard}>
                  <h3 className={styles.cardTitle}>Question {index + 1}</h3>

                  <div className={styles.questionSection}>
                    <h4 className={styles.sectionTitle}>
                      <MessageSquare className={styles.sectionIcon} size={18} />
                      Question
                    </h4>
                    <p className={styles.sectionContent}>{q.question}</p>
                  </div>

                  <div className={styles.questionSection}>
                    <h4 className={styles.sectionTitle}>
                      <User className={styles.sectionIcon} size={18} />
                      Your Response
                    </h4>
                    <p className={styles.sectionContent}>{q.response}</p>
                  </div>

                  <div className={styles.questionSection}>
                    <h4 className={styles.sectionTitle}>
                      <ThumbsUp className={styles.sectionIcon} size={18} />
                      AI Feedback
                    </h4>
                    <p className={styles.sectionContent}>{q.feedback}</p>
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
