import React, { useState } from 'react'
// Icons for close button and star rating
import { X, Star } from 'lucide-react'
// Custom UI components
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
// Import styles for the modal
import styles from '@/styles/interviewFeedbackModal.module.css'

// Props expected by this modal component
interface InterviewFeedbackModalProps {
  isOpen: boolean // Whether the modal is visible
  onClose: () => void // Function to close the modal
  interviewId: number // ID of the interview (not used here but may be used elsewhere)
  onSubmit: (feedback: { content: string; rating: number }) => Promise<void> // Callback when feedback is submitted
}

// Functional component for the Interview Feedback Modal
const InterviewFeedbackModal: React.FC<InterviewFeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  // State for the feedback text
  const [feedback, setFeedback] = useState('')
  // State for the star rating (1 to 5)
  const [rating, setRating] = useState(0)
  // Tracks whether the feedback is being submitted
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Error message to display if validation fails
  const [error, setError] = useState('')

  // Function to handle when the user submits the feedback
  const handleSubmit = async () => {
    // If the feedback text is empty, show an error
    if (!feedback.trim()) {
      setError('Please provide feedback before submitting')
      return
    }

    setError('')
    setIsSubmitting(true) // Start loading state

    try {
      // Submit feedback and rating to parent component
      await onSubmit({
        content: feedback,
        rating: rating,
      })

      // Reset form and close modal
      setFeedback('')
      setRating(0)
      onClose()
    } catch (error) {
      // If something goes wrong, show a general error
      setError('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Renders 5 clickable stars for rating
  const renderStars = () => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)} // Set rating when star is clicked
          className={`${styles.starButton} ${
            i <= rating ? styles.starActive : ''
          }`}
        >
          <Star
            size={24}
            fill={i <= rating ? 'currentColor' : 'none'} // Fill only selected stars
            className={i <= rating ? styles.starSelected : ''}
          />
        </button>
      )
    }
    return stars
  }

  // If modal is closed, don’t render anything
  if (!isOpen) return null

  return (
    <>
      {/* Overlay that darkens the background and closes modal on click */}
      <div className={styles.modalOverlay} onClick={onClose} />

      {/* Modal box itself; clicking inside shouldn't close it */}
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Interview Feedback</h2>
          {/* Button to close modal */}
          <button className={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.feedbackForm}>
            {/* Rating section */}
            <div className={styles.ratingSection}>
              <h3 className={styles.sectionTitle}>
                Rate your interview experience:
              </h3>
              <div className={styles.starRating}>{renderStars()}</div>
            </div>

            {/* Feedback text section */}
            <div className={styles.feedbackSection}>
              <h3 className={styles.sectionTitle}>Share your feedback:</h3>
              <Textarea
                value={feedback}
                onChange={(e) => {
                  setFeedback(e.target.value)
                  // Clear error if user starts typing
                  if (e.target.value.trim()) setError('')
                }}
                placeholder="What did you think of the interview questions? How can we improve your experience?"
                className={styles.feedbackTextarea}
                rows={6}
              />
              {/* Show error message if there's an issue */}
              {error && <p className={styles.errorText}>{error}</p>}
            </div>
          </div>
        </div>

        {/* Footer with action buttons */}
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
