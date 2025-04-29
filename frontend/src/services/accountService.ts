import axios from 'axios'

interface UpdateUserProfileData {
  target_job_title?: string
}

export async function updateUserProfile(data: UpdateUserProfileData): Promise<void> {
  try {
    const token = localStorage.getItem('token')

    await axios.put(
      '/api/accounts/profile/',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    )
  } catch (error) {
    console.error('Failed to update user profile:', error)
    throw error
  }
}
