// This represents a single interview question shown to the user
export interface InterviewQuestion {
  id: number // Unique ID for the question
  question: string // Actual question text
  question_number?: number // Optional: index/order in the interview
}

// This is how we store the user's rating (like/dislike) for a question
export interface QuestionRating {
  id: number // Rating ID
  rating: string // 'LIKE' or 'DISLIKE'
  created_at: string // When the rating was submitted
}

// This is one full question + answer set during the interview
export interface InterviewAnswer {
  id: number // Answer ID
  question_id?: number // Optional question reference (not always needed)
  question_text: string // Question that was asked
  user_response: string // What the user said
  ai_feedback: string // What the AI responded with
  created_at: string // Timestamp for when answer was submitted
  question_number: number // Which number question it was in the flow
  rating?: QuestionRating | null // Optional rating info if user liked/disliked it
}

// Feedback for a specific response (used in some views where we're just showing answer/feedback without ratings)
export interface InterviewFeedback {
  id: number
  question_text: string
  user_response: string
  ai_feedback: string
  created_at: string
  question_number: number
}

// This is used for the final feedback at the end of an interview
export interface FeedbackSubmission {
  id: number // Feedback entry ID
  content: string // What the user typed in
  rating: number // Star rating (1-5)
  created_at: string // When the feedback was submitted
}

// Represents an active or completed interview session
export interface InterviewSession {
  id: number
  start_time: string // When the session started
  end_time?: string // Optional: when it ended
  status: 'IN_PROGRESS' | 'COMPLETED' // Current status of the interview
  answers: InterviewAnswer[] // All answers the user gave in this session
}

// Past interviews shown in history tab (includes feedback too if user gave it)
export interface PastInterview {
  id: number
  start_time: string
  end_time: string
  status: string // 'COMPLETED' or other status
  answers: InterviewAnswer[] // What questions were asked and answered
  feedback?: FeedbackSubmission | null // Final feedback (optional)
}
