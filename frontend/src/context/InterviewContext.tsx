import React, { createContext, useContext, useState, useCallback } from 'react'
// Types used in this context
import {
  InterviewSession,
  InterviewQuestion,
  InterviewFeedback,
  PastInterview,
  QuestionRating,
} from '../types/interview'
// Service that talks to the backend
import { interviewService } from '../services/interviewService'

// This defines all the data and functions available in the context
interface InterviewContextType {
  currentSession: InterviewSession | null
  currentQuestion: InterviewQuestion | null
  pastInterviews: PastInterview[]
  totalInterviews: number
  isLoading: boolean
  error: string | null

  startInterview: () => Promise<void>
  getNextQuestion: () => Promise<void>
  skipQuestion: () => Promise<void>
  submitResponse: (response: string) => Promise<InterviewFeedback>
  completeInterview: () => Promise<void>
  fetchPastInterviews: (page?: number, limit?: number) => Promise<void>
  clearError: () => void
  resetInterview: () => void
  rateQuestion: (
    questionId: number,
    interviewId: number,
    rating: string
  ) => Promise<QuestionRating>
  submitFeedback: (
    interviewId: number,
    content: string,
    rating: number
  ) => Promise<InterviewFeedback>
  getQuestionRating?: (
    questionId: number,
    interviewId: number
  ) => Promise<QuestionRating | null>
}

// Create the InterviewContext with no default value
const InterviewContext = createContext<InterviewContextType | undefined>(
  undefined
)

// Context provider that wraps your app
export const InterviewProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State variables to store current session, current question, list of past interviews, etc.
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(
    null
  )
  const [currentQuestion, setCurrentQuestion] =
    useState<InterviewQuestion | null>(null)
  const [pastInterviews, setPastInterviews] = useState<PastInterview[]>([])
  const [totalInterviews, setTotalInterviews] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Clears any existing error messages
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Resets the interview session state
  const resetInterview = useCallback(() => {
    setCurrentSession(null)
    setCurrentQuestion(null)
    setError(null)
  }, [])

  // Handles and sets error messages
  const handleError = useCallback((error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred'
    setError(message)
    throw error
  }, [])

  // Loads past interview data (with optional pagination)
  const fetchPastInterviews = useCallback(
    async (page = 1, limit = 10) => {
      setIsLoading(true)
      setError(null)
      try {
        const { results, count } = await interviewService.getPastInterviews(
          page,
          limit
        )
        setPastInterviews(results)
        setTotalInterviews(count)
      } catch (error) {
        handleError(error)
      } finally {
        setIsLoading(false)
      }
    },
    [handleError]
  )

  // Ends the current interview session and updates the past interview list
  const completeInterview = useCallback(async () => {
    if (!currentSession) throw new Error('No active interview session')

    setIsLoading(true)
    setError(null)
    try {
      await interviewService.completeInterview(currentSession.id)
      setCurrentSession(null)
      setCurrentQuestion(null)
      await fetchPastInterviews()
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, [currentSession, handleError, fetchPastInterviews])

  // Gets the next question in the interview
  const getNextQuestion = useCallback(async () => {
    if (!currentSession) throw new Error('No active interview session')

    setIsLoading(true)
    setError(null)
    try {
      const question = await interviewService.getNextQuestion()
      setCurrentQuestion(question)
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('No more questions available')
      ) {
        setCurrentQuestion(null)
        await completeInterview()
      } else {
        handleError(error)
      }
    } finally {
      setIsLoading(false)
    }
  }, [currentSession, handleError, completeInterview])

  // Starts a new interview session and loads the first question
  const startInterview = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setCurrentSession(null)
      setCurrentQuestion(null)

      const session = await interviewService.startInterview()
      setCurrentSession(session)

      const question = await interviewService.getNextQuestion()
      setCurrentQuestion(question)
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Skips the current question and loads the next one
  const skipQuestion = useCallback(async () => {
    if (!currentSession) throw new Error('No active interview session')

    setIsLoading(true)
    try {
      const nextQuestion = await interviewService.getNextQuestion()
      setCurrentQuestion(nextQuestion)
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('No more questions available')
      ) {
        await completeInterview()
      } else {
        handleError(error)
      }
    } finally {
      setIsLoading(false)
    }
  }, [currentSession, handleError, completeInterview])

  // Sends user's answer to the current question and returns AI feedback
  const submitResponse = useCallback(
    async (response: string): Promise<InterviewFeedback> => {
      if (!currentSession || !currentQuestion) {
        throw new Error('No active interview session or question')
      }

      setIsLoading(true)
      setError(null)
      try {
        const feedback = await interviewService.submitResponse(
          currentSession.id,
          currentQuestion.id,
          response
        )
        return feedback
      } catch (error) {
        handleError(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [currentSession, currentQuestion, handleError]
  )

  // Submits user rating (LIKE / DISLIKE) for a question
  const rateQuestion = useCallback(
    async (
      questionId: number,
      interviewId: number,
      rating: string
    ): Promise<QuestionRating> => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await interviewService.rateQuestion(
          questionId,
          interviewId,
          rating
        )
        return result
      } catch (error) {
        handleError(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [handleError]
  )

  // Submits final feedback after the interview ends
  const submitFeedback = useCallback(
    async (
      interviewId: number,
      content: string,
      rating: number
    ): Promise<InterviewFeedback> => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await interviewService.submitFeedback(
          interviewId,
          content,
          rating
        )
        await fetchPastInterviews()
        return result
      } catch (error) {
        handleError(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [handleError, fetchPastInterviews]
  )

  // Fetches the user's past rating for a specific question (optional helper)
  const getQuestionRating = useCallback(
    async (
      questionId: number,
      interviewId: number
    ): Promise<QuestionRating | null> => {
      try {
        return await interviewService.getQuestionRating(questionId, interviewId)
      } catch (error) {
        console.error('Error fetching question rating:', error)
        return null
      }
    },
    []
  )

  // Pack all values/functions into a single object to pass to the provider
  const value = {
    currentSession,
    currentQuestion,
    pastInterviews,
    totalInterviews,
    isLoading,
    error,
    startInterview,
    getNextQuestion,
    skipQuestion,
    submitResponse,
    completeInterview,
    fetchPastInterviews,
    clearError,
    resetInterview,
    rateQuestion,
    submitFeedback,
    getQuestionRating,
  }

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  )
}

// Custom hook to use the interview context
export const useInterview = () => {
  const context = useContext(InterviewContext)
  if (context === undefined) {
    throw new Error('useInterview must be used within an InterviewProvider')
  }
  return context
}

export default InterviewProvider
