import React, { useState } from 'react'
// Close (X) icon
import { X } from 'lucide-react'
// CSS module for modal styles
import styles from '@/styles/jobTitleModal.module.css'

// Props expected by the JobTitleModal component
interface JobTitleModalProps {
  isOpen: boolean // Whether the modal is open
  onClose: () => void // Function to close the modal
  onConfirm: (newJobTitle?: string) => void // Called when user clicks "Confirm"
  onSkip: () => void // Called when user clicks "Skip"
}

// Component for updating a target job title before starting the interview
const JobTitleModal: React.FC<JobTitleModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onSkip,
}) => {
  // Local state to track the job title input
  const [newJobTitle, setNewJobTitle] = useState('')

  // If modal isn’t open, don’t render anything
  if (!isOpen) return null

  // Handles the confirm button click
  const handleConfirm = () => {
    // If input is empty, pass undefined instead of an empty string
    onConfirm(newJobTitle.trim() || undefined)
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        {/* Modal header with title and close button */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Update Target Job Title</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Main modal content */}
        <div className={styles.modalBody}>
          <p className={styles.formLabel}>
            Would you like to change your target job title for this interview?
            If you skip, we'll use the one you registered with.
          </p>

          {/* Input field for optional new job title */}
          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="Enter new job title (optional)"
              value={newJobTitle}
              onChange={(e) => setNewJobTitle(e.target.value)}
              className={styles.formInput}
            />
          </div>

          {/* Buttons to skip or confirm the change */}
          <div className={styles.modalActions}>
            <button
              className={`${styles.modalButton} ${styles.cancelButton}`}
              onClick={onSkip}
            >
              Skip
            </button>
            <button
              className={`${styles.modalButton} ${styles.confirmButton}`}
              onClick={handleConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobTitleModal
