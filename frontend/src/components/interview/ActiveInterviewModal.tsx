// Fullscreen modal used during an active mock interview session
// Handles displaying the question, collecting voice/text responses, and providing feedback
import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  X,
  Mic,
  MicOff,
  Send,
  SkipForward,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import styles from '@/styles/activeInterviewModal.module.css'
import { useInterview } from '@/context/InterviewContext'

// Props passed into the modal component
interface InterviewModalProps {
  isOpen: boolean
  onClose: () => void
  onInterviewComplete: (interviewId: number) => void
}

// Core interview modal component
const ActiveInterviewModal: React.FC<InterviewModalProps> = ({
  isOpen,
  onClose,
  onInterviewComplete,
}) => {
  // Interview state from context
  const {
    currentSession,
    currentQuestion,
    submitResponse,
    completeInterview,
    skipQuestion,
    resetInterview,
    rateQuestion,
    getQuestionRating,
  } = useInterview()

  // Local UI and logic state
  const [response, setResponse] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isResponseSubmitted, setIsResponseSubmitted] = useState(false)
  const [showError, setShowError] = useState(false)
  const [isLastQuestion, setIsLastQuestion] = useState(false)
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1)
  const [displayedFeedback, setDisplayedFeedback] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [questionRating, setQuestionRating] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const hasRecognitionSupport =
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

  // On question/session load, check for an existing question rating
  useEffect(() => {
    if (currentQuestion && currentSession) {
      const checkForExistingRating = async () => {
        try {
          if (getQuestionRating) {
            const ratingData = await getQuestionRating(
              currentQuestion.id,
              currentSession.id
            )
            setQuestionRating(ratingData?.rating || null)
          }
        } catch (error) {
          console.error('Error fetching question rating:', error)
        }
      }
      checkForExistingRating()
    }
  }, [currentQuestion, currentSession, getQuestionRating])

  // Keep track of question number and reset when modal is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionNumber((prev) => Math.min(prev, 5))
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && !currentSession) {
      setCurrentQuestionNumber(1)
    }
  }, [isOpen, currentSession])

  // Typewriter effect for showing AI feedback slowly
  useEffect(() => {
    if (feedback) {
      setDisplayedFeedback('')
      setIsTyping(true)

      let index = 0
      const typingSpeed = 30

      const timer = setInterval(() => {
        setDisplayedFeedback((prev) => {
          if (index < feedback.length) {
            index++
            return feedback.substring(0, index)
          }
          return prev
        })

        if (index >= feedback.length) {
          clearInterval(timer)
          setIsTyping(false)
        }
      }, typingSpeed)

      return () => {
        clearInterval(timer)
        if (feedback && index < feedback.length) {
          setDisplayedFeedback(feedback)
          setIsTyping(false)
        }
      }
    }
  }, [feedback])

  // Submits the current answer and shows AI feedback
  const validateAndSubmit = useCallback(async () => {
    if (!response.trim()) {
      setShowError(true)
      return
    }

    setShowError(false)
    setIsSubmitting(true)

    try {
      if (!currentQuestion) throw new Error('No current question found')

      const feedbackResponse = await submitResponse(response)
      setFeedback(feedbackResponse.ai_feedback)
      setIsResponseSubmitted(true)
      setIsLastQuestion(currentQuestionNumber >= 5)
    } catch (error) {
      console.error('Error submitting response:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [response, submitResponse, currentQuestion, currentQuestionNumber])

  // Skips current question without answering
  const handleSkipQuestion = useCallback(async () => {
    setResponse('')
    setFeedback(null)
    setIsResponseSubmitted(false)
    setQuestionRating(null)
    await skipQuestion()
  }, [skipQuestion])

  // Moves to next question manually
  const handleNextQuestion = useCallback(async () => {
    setResponse('')
    setFeedback(null)
    setIsResponseSubmitted(false)
    setQuestionRating(null)
    setCurrentQuestionNumber((prev) => Math.min(prev + 1, 5))
    await skipQuestion()
  }, [skipQuestion])

  // Handles toggling mic input on/off
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

  // Finalizes the interview session
  const handleComplete = useCallback(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
    }
    completeInterview()
    if (currentSession) {
      onInterviewComplete(currentSession.id)
    }
    setCurrentQuestionNumber(1)
    resetInterview()
    onClose()
  }, [
    isListening,
    onClose,
    completeInterview,
    resetInterview,
    onInterviewComplete,
    currentSession,
  ])

  // Submits question rating (LIKE or DISLIKE)
  const handleRateQuestion = useCallback(
    async (rating: string) => {
      if (!currentQuestion || !currentSession) return
      if (questionRating === rating) return

      setQuestionRating(rating)

      try {
        if (rateQuestion) {
          await rateQuestion(currentQuestion.id, currentSession.id, rating)
        }
      } catch (error) {
        console.error('Error rating question:', error)
        setQuestionRating(null)
      }
    },
    [currentQuestion, currentSession, rateQuestion, questionRating]
  )

  // Sets up speech recognition if supported
  useEffect(() => {
    if (hasRecognitionSupport) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()

      if (recognitionRef.current) {
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        // Updates response text live while speaking
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

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setResponse('')
      setFeedback(null)
      setIsListening(false)
      setIsResponseSubmitted(false)
      setQuestionRating(null)
      if (!currentSession) {
        setCurrentQuestionNumber(1)
      }
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isOpen, currentSession])

  // If browser doesn’t support speech recognition, show fallback
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

  // Don’t render if not open or question is missing
  if (!isOpen || !currentQuestion) return null

  // UI rendered to screen
  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose} />
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header section with close button */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Interview Question</h2>
          <div className={styles.questionCount}>
            Question {currentQuestionNumber} of 5
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Question + response input */}
        <div className={styles.modalBody}>
          <div className={styles.interviewGrid}>
            {/* Display the question */}
            <div className={styles.questionSection}>
              <h3 className={styles.sectionTitle}>Question:</h3>
              <p className={styles.questionText}>{currentQuestion.question}</p>
            </div>

            {/* User response area with mic toggle */}
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

              {/* Textarea for typing response */}
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

              {/* Feedback section shown after submitting */}
              {feedback && (
                <div className={styles.feedbackSection}>
                  <Alert>
                    <AlertDescription>
                      <div className={styles.feedbackContent}>
                        <h4 className={styles.feedbackTitle}>AI Feedback:</h4>
                        <p className={styles.feedbackText}>
                          {displayedFeedback}
                          {isTyping && <span className={styles.cursor}>|</span>}
                        </p>

                        {isResponseSubmitted && (
                          <div className={styles.ratingButtons}>
                            <p className={styles.ratingLabel}>
                              Was this question helpful?
                            </p>
                            <div className={styles.ratingControls}>
                              <Button
                                variant={
                                  questionRating === 'LIKE'
                                    ? 'default'
                                    : 'outline'
                                }
                                size="sm"
                                onClick={() => handleRateQuestion('LIKE')}
                                className={`${styles.ratingButton} ${
                                  questionRating === 'LIKE'
                                    ? styles.ratingButtonActive
                                    : ''
                                }`}
                              >
                                <ThumbsUp
                                  size={16}
                                  className={`mr-1 ${
                                    questionRating === 'LIKE'
                                      ? 'text-white'
                                      : ''
                                  }`}
                                />
                                Helpful
                              </Button>
                              <Button
                                variant={
                                  questionRating === 'DISLIKE'
                                    ? 'default'
                                    : 'outline'
                                }
                                size="sm"
                                onClick={() => handleRateQuestion('DISLIKE')}
                                className={`${styles.ratingButton} ${
                                  questionRating === 'DISLIKE'
                                    ? styles.ratingButtonActive
                                    : ''
                                }`}
                              >
                                <ThumbsDown
                                  size={16}
                                  className={`mr-1 ${
                                    questionRating === 'DISLIKE'
                                      ? 'text-white'
                                      : ''
                                  }`}
                                />
                                Not Helpful
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with submit/next/complete actions */}
        <div className={styles.modalFooter}>
          {!isLastQuestion && (
            <Button
              variant="outline"
              onClick={
                isResponseSubmitted ? handleNextQuestion : handleSkipQuestion
              }
              className={styles.skipButton}
              disabled={isSubmitting}
            >
              <SkipForward size={16} className="mr-2" />
              {isResponseSubmitted ? 'Next Question' : 'Skip Question'}
            </Button>
          )}

          {!isResponseSubmitted && (
            <Button
              variant="secondary"
              onClick={validateAndSubmit}
              disabled={isSubmitting}
              className={styles.submitButton}
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
          )}

          {isResponseSubmitted && isLastQuestion && (
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
