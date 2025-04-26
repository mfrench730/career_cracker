import React, { useState } from 'react'
import { X, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import styles from '@/styles/interviewFeedbackModal.module.css'

interface InterviewFeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  interviewId: number
  onSubmit: (feedback: { content: string; rating: number }) => Promise<void>
}

const InterviewFeedbackModal: React.FC<InterviewFeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      setError('Please provide feedback before submitting')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await onSubmit({
        content: feedback,
        rating: rating,
      })

      setFeedback('')
      setRating(0)
      onClose()
    } catch (error) {
      setError('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = () => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          className={`${styles.starButton} ${
            i <= rating ? styles.starActive : ''
          }`}
        >
          <Star
            size={24}
            fill={i <= rating ? 'currentColor' : 'none'}
            className={i <= rating ? styles.starSelected : ''}
          />
        </button>
      )
    }
    return stars
  }

  if (!isOpen) return null

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose} />
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Interview Feedback</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.feedbackForm}>
            <div className={styles.ratingSection}>
              <h3 className={styles.sectionTitle}>
                Rate your interview experience:
              </h3>
              <div className={styles.starRating}>{renderStars()}</div>
            </div>

            <div className={styles.feedbackSection}>
              <h3 className={styles.sectionTitle}>Share your feedback:</h3>
              <Textarea
                value={feedback}
                onChange={(e) => {
                  setFeedback(e.target.value)
                  if (e.target.value.trim()) setError('')
                }}
                placeholder="What did you think of the interview questions? How can we improve your experience?"
                className={styles.feedbackTextarea}
                rows={6}
              />
              {error && <p className={styles.errorText}>{error}</p>}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <Button
            variant="outline"
            onClick={onClose}
            className={styles.cancelButton}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </div>
    </>
  )
}

export default InterviewFeedbackModal
