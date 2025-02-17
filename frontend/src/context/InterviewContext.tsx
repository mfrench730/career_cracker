import React, { createContext, useContext, useState } from 'react'
import {
  InterviewSession,
  UserResponse,
  InterviewFeedback,
  InterviewQuestion,
  PastInterview,
} from '../types/interview'
import { interviewService } from '../services/interviewService'

interface InterviewContextType {
  currentSession: InterviewSession | null
  currentQuestion: InterviewQuestion | null
  currentFeedbacks: InterviewFeedback[]
  pastInterviews: PastInterview[]

  startInterview: () => Promise<void>
  getNextQuestion: () => Promise<void>
  submitQuestionResponse: (response: UserResponse) => Promise<InterviewFeedback>
  endInterview: (returnSession?: boolean) => Promise<InterviewSession | void>
  fetchPastInterviews: (page?: number, limit?: number) => Promise<void>
}

const InterviewContext = createContext<InterviewContextType | undefined>(
  undefined
)

export const InterviewProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(
    null
  )
  const [currentQuestion, setCurrentQuestion] =
    useState<InterviewQuestion | null>(null)
  const [currentFeedbacks, setCurrentFeedbacks] = useState<InterviewFeedback[]>(
    []
  )
  const [pastInterviews, setPastInterviews] = useState<PastInterview[]>([])

  const startInterview = async () => {
    try {
      const session = await interviewService.startInterview()
      setCurrentSession(session)
      setCurrentFeedbacks([])
      await getNextQuestion()
    } catch (error) {
      console.error('Failed to start interview:', error)
      throw error
    }
  }

  const getNextQuestion = async () => {
    try {
      const question = await interviewService.getNextQuestion()
      setCurrentQuestion(question)
    } catch (error) {
      console.error('Failed to get next question:', error)
      throw error
    }
  }

  const submitQuestionResponse = async (
    response: UserResponse
  ): Promise<InterviewFeedback> => {
    if (!currentSession) {
      throw new Error('No active interview session')
    }

    try {
      const feedback = await interviewService.submitResponse(
        currentSession.id,
        response
      )
      setCurrentFeedbacks((prev) => [...prev, feedback])
      await getNextQuestion()
      return feedback
    } catch (error) {
      console.error('Failed to submit response:', error)
      throw error
    }
  }

  const endInterview = async (): Promise<void> => {
    if (currentSession) {
      try {
        await interviewService.completeInterview(currentSession.id)
        setCurrentSession(null)
        setCurrentQuestion(null)
        setCurrentFeedbacks([])
      } catch (error) {
        console.error('Failed to end interview:', error)
        throw error
      }
    }
  }

  const fetchPastInterviews = async (page = 1, limit = 10) => {
    try {
      const interviews = await interviewService.getPastInterviews(page, limit)
      setPastInterviews(interviews)
    } catch (error) {
      console.error('Failed to fetch past interviews:', error)
      throw error
    }
  }

  return (
    <InterviewContext.Provider
      value={{
        currentSession,
        currentQuestion,
        currentFeedbacks,
        pastInterviews,
        startInterview,
        getNextQuestion,
        submitQuestionResponse,
        endInterview,
        fetchPastInterviews,
      }}
    >
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
