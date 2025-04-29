import React, { useState } from 'react';
import { useProfile } from '@/context/ProfileContext'; // Custom context for profile state and updates

// Define the shape of the profile object expected in this form
type Profile = {
  full_name: string;
  major: string;
  education_level: string;
  experience_level: string;
  target_job_title: string;
  preferred_interview_type: string[]; // Stored as an array of strings
  preferred_language: string;
};

// Define the props expected by this component
interface EditProfileFormProps {
  profile: Profile;           // Initial profile data to edit
  onClose: () => void;        // Function to close the modal or form
}

// Functional component definition
const EditProfileForm: React.FC<EditProfileFormProps> = ({ profile, onClose }) => {
  const { updateProfile } = useProfile(); // Access the context function to update profile

  // Initialize form state with the passed-in profile data.
  // Default to empty strings or arrays in case of missing values.
  const [formData, setFormData] = useState<Profile>({
    full_name: profile.full_name || '',
    major: profile.major || '',
    education_level: profile.education_level || '',
    experience_level: profile.experience_level || '',
    target_job_title: profile.target_job_title ?? '',
    preferred_interview_type: profile.preferred_interview_type ?? [],
    preferred_language: profile.preferred_language ?? '',
  });

  // Handle changes to form inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Special handling for array input (e.g., a comma-separated list)
    if (name === 'preferred_interview_type') {
      setFormData((prev: Profile) => ({
        ...prev,
        [name]: value.split(',').map(item => item.trim()), // Convert comma-separated string to array
      }));
    } else {
      // Generic update for other text inputs
      setFormData((prev: Profile) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page reload
    await updateProfile(formData); // Call context function to save the updated profile
    onClose(); // Close the modal or form
  };

  // Render the form UI
  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Profile</h2>

      {/* Input fields for each profile property */}
      <label>Full Name</label>
      <input name="full_name" value={formData.full_name} onChange={handleChange} />

      <label>Major</label>
      <input name="major" value={formData.major} onChange={handleChange} />

      <label>Education Level</label>
      <input name="education_level" value={formData.education_level} onChange={handleChange} />

      <label>Experience Level</label>
      <input name="experience_level" value={formData.experience_level} onChange={handleChange} />

      <label>Target Job Title</label>
      <input name="target_job_title" value={formData.target_job_title} onChange={handleChange} />

      <label>Preferred Interview Type</label>
      <input
        name="preferred_interview_type"
        value={formData.preferred_interview_type.join(', ')} // Convert array to string for display
        onChange={handleChange}
      />

      <label>Preferred Language</label>
      <input name="preferred_language" value={formData.preferred_language} onChange={handleChange} />

      {/* Submit and Cancel buttons */}
      <div style={{ marginTop: '1rem' }}>
        <button type="submit" className="primaryButton">Save</button>
        <button type="button" className="secondaryButton" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

export default EditProfileForm;
