export interface UserProfile {
  username: string
  email: string
  full_name: string
  major: string
  education_level: string
  experience_level: string
  preferred_interview_type: string[]
  preferred_language: string
  resume_url: string | null
  target_job_title: string | null
}

export type UpdateProfileData = Partial<Omit<UserProfile, 'username' | 'email'>> //Allows all properties to be updated except username and email
