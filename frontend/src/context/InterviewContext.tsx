import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  InterviewSession,
  InterviewQuestion,
  InterviewFeedback,
  PastInterview,
} from '../types/interview'
import { interviewService } from '../services/interviewService'

interface InterviewContextType {
  currentSession: InterviewSession | null
  currentQuestion: InterviewQuestion | null
  pastInterviews: PastInterview[]
  totalInterviews: number
  isLoading: boolean
  error: string | null

  startInterview: () => Promise<void>
  getNextQuestion: () => Promise<void>
  submitResponse: (response: string) => Promise<InterviewFeedback>
  completeInterview: () => Promise<void>
  fetchPastInterviews: (page?: number, limit?: number) => Promise<void>
  clearError: () => void
}

const InterviewContext = createContext<InterviewContextType | undefined>(
  undefined
)

export const InterviewProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(
    null
  )
  const [currentQuestion, setCurrentQuestion] =
    useState<InterviewQuestion | null>(null)
  const [pastInterviews, setPastInterviews] = useState<PastInterview[]>([])
  const [totalInterviews, setTotalInterviews] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleError = useCallback((error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred'
    setError(message)
    throw error
  }, [])

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

  const completeInterview = useCallback(async () => {
    if (!currentSession) {
      throw new Error('No active interview session')
    }

    setIsLoading(true)
    setError(null)
    try {
      await interviewService.completeInterview(currentSession.id)
      setCurrentSession(null)
      setCurrentQuestion(null)

      // Refresh the past interviews list
      await fetchPastInterviews()
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, [currentSession, handleError, fetchPastInterviews])

  const getNextQuestion = useCallback(async () => {
    if (!currentSession) {
      throw new Error('No active interview session')
    }

    setIsLoading(true)
    setError(null)
    try {
      const question = await interviewService.getNextQuestion()
      setCurrentQuestion(question)
    } catch (error) {
      // Special handling for when there are no more questions
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

  const startInterview = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const session = await interviewService.startInterview()
      setCurrentSession(session)

      // Get the first question automatically
      const question = await interviewService.getNextQuestion()
      setCurrentQuestion(question)
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

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

  const value = {
    currentSession,
    currentQuestion,
    pastInterviews,
    totalInterviews,
    isLoading,
    error,
    startInterview,
    getNextQuestion,
    submitResponse,
    completeInterview,
    fetchPastInterviews,
    clearError,
  }

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  )
}

export const useInterview = () => {
  const context = useContext(InterviewContext)
  if (context === undefined) {
    throw new Error('useInterview must be used within an InterviewProvider')
  }
  return context
}

export default InterviewProvider
