export interface InterviewQuestion {
  id: number
  question: string
  question_number?: number
}

export interface InterviewFeedback {
  id: number
  question_text: string
  user_response: string
  ai_feedback: string
  created_at: string
  question_number: number
}

export interface InterviewSession {
  id: number
  start_time: string
  end_time?: string
  status: 'IN_PROGRESS' | 'COMPLETED'
  answers: InterviewFeedback[]
}

export interface PastInterview {
  id: number
  start_time: string
  end_time: string
  status: string
  answers: InterviewFeedback[]
}
