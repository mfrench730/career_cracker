import React, { useState, useEffect, useCallback, useRef } from 'react'
import { X, Mic, MicOff, Send, SkipForward, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import styles from '@/styles/activeInterviewModal.module.css'
import { useInterview } from '@/context/InterviewContext'

interface InterviewModalProps {
  isOpen: boolean
  onClose: () => void
}

const ActiveInterviewModal: React.FC<InterviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentSession, currentQuestion, submitResponse, completeInterview } =
    useInterview()

  const [response, setResponse] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isResponseSubmitted, setIsResponseSubmitted] = useState(false)
  const [showError, setShowError] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const hasRecognitionSupport =
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

  const validateAndSubmit = useCallback(async () => {
    if (!response.trim()) {
      setShowError(true)
      return
    }

    setShowError(false)
    setIsSubmitting(true)
    try {
      const feedbackResponse = await submitResponse(response)
      setFeedback(feedbackResponse.ai_feedback)
      setIsResponseSubmitted(true)
    } catch (error) {
      console.error('Error submitting response:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [response, submitResponse])

  const handleMicToggle = useCallback(() => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [isListening])

  const handleComplete = useCallback(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
    }
    completeInterview()
    onClose()
  }, [isListening, onClose, completeInterview])

  useEffect(() => {
    if (hasRecognitionSupport) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()

      if (recognitionRef.current) {
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          if (!event.results) return

          const results = Array.from(event.results)
          if (results.length === 0) return

          const lastResult = results[results.length - 1]
          if (!lastResult) return

          const alternative = lastResult[0]
          if (!alternative?.transcript) return

          let finalText = ''

          for (let i = 0; i < results.length - 1; i++) {
            const result = results[i]
            if (result?.isFinal && result[0]?.transcript) {
              finalText += result[0].transcript + ' '
            }
          }

          finalText += alternative.transcript

          setResponse(finalText.trim())
        }

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [hasRecognitionSupport])

  useEffect(() => {
    if (isOpen) {
      setResponse('')
      setFeedback(null)
      setIsListening(false)
      setIsResponseSubmitted(false)
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isOpen])

  if (!hasRecognitionSupport) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Browser Not Supported</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          <div className={styles.modalBody}>
            <Alert>
              <AlertDescription>
                Sorry, your browser doesn't support speech recognition. Please
                try using a modern browser like Chrome.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    )
  }

  if (!isOpen || !currentQuestion) return null

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose} />
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Interview Question</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.interviewGrid}>
            <div className={styles.questionSection}>
              <h3 className={styles.sectionTitle}>Question:</h3>
              <p className={styles.questionText}>{currentQuestion.question}</p>
            </div>

            <div className={styles.responseSection}>
              <div className={styles.responseHeader}>
                <h3 className={styles.sectionTitle}>Your Response:</h3>
                <Button
                  variant={isListening ? 'secondary' : 'destructive'}
                  size="sm"
                  className={`${styles.micButton} ${
                    isListening ? styles.recording : ''
                  } ${
                    isResponseSubmitted || isSubmitting
                      ? styles.disabledButton
                      : ''
                  }`}
                  onClick={handleMicToggle}
                  disabled={isResponseSubmitted || isSubmitting}
                >
                  {isListening ? <Mic size={16} /> : <MicOff size={16} />}
                </Button>
              </div>

              <div className={styles.textareaContainer}>
                <Textarea
                  value={response}
                  onChange={(e) => {
                    setResponse(e.target.value)
                    setShowError(false)
                  }}
                  placeholder="Type your response here or click the microphone to use speech-to-text..."
                  className={`${styles.responseInput} ${
                    isListening ? styles.recording : ''
                  } ${showError ? styles.error : ''} ${
                    isResponseSubmitted || isListening || isSubmitting
                      ? styles.disabledInput
                      : ''
                  }`}
                  disabled={isResponseSubmitted || isListening || isSubmitting}
                />
                {showError && (
                  <p className={styles.errorText}>
                    Please provide a response before submitting
                  </p>
                )}
              </div>

              {feedback && (
                <div className={styles.feedbackSection}>
                  <Alert>
                    <AlertDescription>
                      <div className={styles.feedbackContent}>
                        <h4 className={styles.feedbackTitle}>AI Feedback:</h4>
                        <p className={styles.feedbackText}>{feedback}</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <Button
            variant="secondary"
            onClick={validateAndSubmit}
            disabled={isResponseSubmitted || isSubmitting}
            className={`${styles.submitButton} ${
              isResponseSubmitted || isSubmitting ? styles.disabledButton : ''
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center">Analyzing...</div>
            ) : (
              <div className="flex items-center">
                <Send size={16} className="mr-2" />
                Submit Response
              </div>
            )}
          </Button>
          {feedback && (
            <Button
              variant="default"
              onClick={handleComplete}
              className={styles.completeButton}
            >
              <CheckCircle size={16} className="mr-2" />
              Complete Interview
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

export default ActiveInterviewModal
