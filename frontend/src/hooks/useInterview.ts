import { useState, useCallback } from 'react'
import {
  InterviewQuestion,
  UserResponse,
  InterviewFeedback,
  InterviewSession,
} from '../types/interview'
import { interviewService } from '../services/interviewService'

export const useInterview = () => {
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(
    null
  )
  const [currentQuestion, setCurrentQuestion] =
    useState<InterviewQuestion | null>(null)
  const [feedbacks, setFeedbacks] = useState<InterviewFeedback[]>([])

  const startInterview = useCallback(async () => {
    try {
      const session = await interviewService.startInterview()
      const firstQuestion = await interviewService.getNextQuestion()

      setCurrentSession(session)
      setCurrentQuestion(firstQuestion)
      setFeedbacks([])
    } catch (error) {
      console.error('Failed to start interview', error)
      throw error
    }
  }, [])

  const submitResponse = useCallback(
    async (text: string): Promise<InterviewFeedback> => {
      if (!currentQuestion || !currentSession) {
        throw new Error('No active interview session')
      }

      try {
        const response: UserResponse = {
          id: Date.now(),
          questionId: currentQuestion.id,
          text: text,
        }

        const feedback = await interviewService.submitResponse(
          currentSession.id,
          response
        )
        setFeedbacks((prev) => [...prev, feedback])

        const nextQuestion = await interviewService.getNextQuestion()
        setCurrentQuestion(nextQuestion)

        return feedback // Return the feedback
      } catch (error) {
        console.error('Failed to submit response', error)
        throw error
      }
    },
    [currentQuestion, currentSession]
  )

  const endInterview = useCallback(async () => {
    if (!currentSession) {
      throw new Error('No active interview session')
    }

    try {
      const completedSession = await interviewService.completeInterview(
        currentSession.id
      )
      setCurrentSession(completedSession)
      setCurrentQuestion(null)
    } catch (error) {
      console.error('Failed to end interview', error)
      throw error
    }
  }, [currentSession])

  return {
    currentSession,
    currentQuestion,
    feedbacks,
    startInterview,
    submitResponse,
    endInterview,
  }
}

export default useInterview
