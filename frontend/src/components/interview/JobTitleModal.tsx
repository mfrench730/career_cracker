import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import styles from '@/styles/interview.module.css'

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
    <>
      <div className={styles.modalOverlay} onClick={onClose} />
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Update Target Job Title</h2>
        <p className="text-muted-foreground mb-6">
          Would you like to change your target job title for this interview?
          <br />
          If you skip, we'll use the one you registered with.
        </p>

        <Input
          type="text"
          placeholder="Enter new job title (optional)"
          value={newJobTitle}
          onChange={(e) => setNewJobTitle(e.target.value)}
          className="mb-6"
        />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onSkip}>Skip</Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </div>
      </div>
    </>
  )
}

export default JobTitleModal
