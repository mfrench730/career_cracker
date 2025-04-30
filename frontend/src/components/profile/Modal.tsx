import React from 'react'
import '@/styles/modal.css'

// Props expected by the Modal component
interface ModalProps {
  isOpen: boolean // Whether the modal should be visible
  onClose: () => void // Function to close the modal
  children: React.ReactNode // Content to be displayed inside the modal
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  // Don't render anything if the modal is not open
  if (!isOpen) return null

  return (
    // Overlay that darkens the background and captures outside clicks
    <div className="modalOverlay" onClick={onClose}>
      {/* Modal content container; clicking inside it won't close the modal */}
      <div className="modalContainer" onClick={(e) => e.stopPropagation()}>
        {/* Close button in the top right corner */}
        <button className="modalCloseButton" onClick={onClose}>
          &times;
        </button>

        {/* Modal content passed in from parent */}
        {children}
      </div>
    </div>
  )
}

export default Modal
