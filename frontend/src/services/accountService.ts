// Import the Axios HTTP client for making API requests
import axios from 'axios'

// Define the shape of the data that can be sent to update the user profile
interface UpdateUserProfileData {
  target_job_title?: string // Optional field to update the user's target job title
}

// Function to update the user's profile with provided data
export async function updateUserProfile(data: UpdateUserProfileData): Promise<void> {
  try {
    // Get the stored JWT token from local storage
    const token = localStorage.getItem('token')

    // Send a PUT request to update the profile
    await axios.put(
      '/api/accounts/profile/', // API endpoint for profile update
      data,                     // Data to update
      {
        headers: {
          'Content-Type': 'application/json',       // Specify JSON content
          Authorization: `Bearer ${token}`,         // Include JWT token for auth
        },
        withCredentials: true, // Include cookies if needed (e.g., CSRF token)
      }
    )
  } catch (error) {
    // Log the error and rethrow it for upstream handling
    console.error('Failed to update user profile:', error)
    throw error
  }
}
