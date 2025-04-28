import React, { useState } from 'react'
import { X } from 'lucide-react'
import styles from '@/styles/jobTitleModal.module.css'

interface JobTitleModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (newJobTitle?: string) => void
  onSkip: () => void
}

const JobTitleModal: React.FC<JobTitleModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onSkip,
}) => {
  const [newJobTitle, setNewJobTitle] = useState('')

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm(newJobTitle.trim() || undefined)
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Update Target Job Title</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.formLabel}>
            Would you like to change your target job title for this interview?  
            If you skip, we'll use the one you registered with.
          </p>

          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="Enter new job title (optional)"
              value={newJobTitle}
              onChange={(e) => setNewJobTitle(e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.modalActions}>
            <button className={`${styles.modalButton} ${styles.cancelButton}`} onClick={onSkip}>
              Skip
            </button>
            <button className={`${styles.modalButton} ${styles.confirmButton}`} onClick={handleConfirm}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobTitleModal