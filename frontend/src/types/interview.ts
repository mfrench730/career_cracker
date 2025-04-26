export interface InterviewQuestion {
  id: number
  question: string
  question_number?: number
}

export interface QuestionRating {
  id: number
  rating: string
  created_at: string
}

export interface InterviewAnswer {
  id: number
  question_id?: number
  question_text: string
  user_response: string
  ai_feedback: string
  created_at: string
  question_number: number
  rating?: QuestionRating | null
}

export interface InterviewFeedback {
  id: number
  question_text: string
  user_response: string
  ai_feedback: string
  created_at: string
  question_number: number
}

export interface FeedbackSubmission {
  id: number
  content: string
  rating: number
  created_at: string
}

export interface InterviewSession {
  id: number
  start_time: string
  end_time?: string
  status: 'IN_PROGRESS' | 'COMPLETED'
  answers: InterviewAnswer[]
}

export interface PastInterview {
  id: number
  start_time: string
  end_time: string
  status: string
  answers: InterviewAnswer[]
  feedback?: FeedbackSubmission | null
}
