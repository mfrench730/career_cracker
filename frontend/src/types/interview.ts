export interface InterviewQuestion {
  id: number
  question: string
}

export interface UserResponse {
  id?: number
  questionId: number
  text: string
}

export interface InterviewFeedback {
  id: number
  questionId: number
  userResponseId: number
  aiFeedback: string
}

export interface InterviewSession {
  id: number
  userId: number
  startTime: string
  endTime?: string
  status: 'IN_PROGRESS' | 'COMPLETED'
  questions: InterviewQuestion[]
  responses: UserResponse[]
  feedbacks: InterviewFeedback[]
}

export interface PastInterview {
  id: number
  date: string
  questions: {
    question: string
    response: string
    feedback: string
  }[]
}
