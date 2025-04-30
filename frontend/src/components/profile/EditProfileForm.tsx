import React, { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';

// Define the shape of the profile object
type Profile = {
  full_name: string;
  major: string;
  education_level: string;
  experience_level: string;
  target_job_title: string;
  preferred_interview_type: string[];
  preferred_language: string;
};

// Props interface for the EditProfileForm component
interface EditProfileFormProps {
  profile: Profile;           // Initial profile data passed from the parent
  onClose: () => void;        // Callback to close the form
}

// Functional component to edit user profile
const EditProfileForm: React.FC<EditProfileFormProps> = ({ profile, onClose }) => {
  const { updateProfile } = useProfile(); // Get update function from context

  // Local state to manage form input values
  const [formData, setFormData] = useState<Profile>({
    full_name: profile.full_name || '',
    target_job_title: profile.target_job_title || '',
    major: profile.major || '',
    education_level: profile.education_level || '',
    experience_level: profile.experience_level || '',
    preferred_interview_type: profile.preferred_interview_type || [],
    preferred_language: profile.preferred_language || '',
  });

  // Handle input text changes (e.g., full_name, target_job_title)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select dropdown changes
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox toggling for preferred interview types
  const handleCheckboxChange = (type: string) => {
    setFormData(prev => {
      const exists = prev.preferred_interview_type.includes(type);
      return {
        ...prev,
        preferred_interview_type: exists
          ? prev.preferred_interview_type.filter(t => t !== type) // Remove if already selected
          : [...prev.preferred_interview_type, type],             // Add if not selected
      };
    });
  };

  // Handle form submission: update profile and close form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData); // Submit updated profile to backend
    onClose();                     // Close the form
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Profile</h2>

      {/* Full Name Input */}
      <label>Full Name</label>
      <input name="full_name" value={formData.full_name} onChange={handleChange} />

      {/* Major Dropdown */}
      <label>Major</label>
      <select name="major" value={formData.major} onChange={handleSelectChange}>
        <option value="">Select Major</option>
        <option value="Computer Science">Computer Science</option>
        <option value="Mechanical Engineering">Mechanical Engineering</option>
        <option value="Electrical Engineering">Electrical Engineering</option>
        <option value="Business">Business</option>
      </select>

      {/* Education Level Dropdown */}
      <label>Education Level</label>
      <select name="education_level" value={formData.education_level} onChange={handleSelectChange}>
        <option value="">Select Education Level</option>
        <option value="High School">High School</option>
        <option value="Undergraduate">Undergraduate</option>
        <option value="Graduate">Graduate</option>
        <option value="PhD">PhD</option>
        <option value="Other">Other</option>
      </select>

      {/* Experience Level Dropdown */}
      <label>Experience Level</label>
      <select name="experience_level" value={formData.experience_level} onChange={handleSelectChange}>
        <option value="">Select Experience Level</option>
        <option value="No Experience">No Experience</option>
        <option value="Entry-Level">Entry-Level</option>
        <option value="1-3 Years">1-3 Years</option>
        <option value="3+ Years">3+ Years</option>
      </select>

      {/* Target Job Title Input */}
      <label>Target Job Title</label>
      <input name="target_job_title" value={formData.target_job_title} onChange={handleChange} />

      {/* Preferred Interview Type Checkboxes */}
      <label>Preferred Interview Type</label>
      <div className="checkbox-group">
        {['Behavioral', 'Technical', 'System Design', 'Case Study'].map(type => (
          <div key={type} className="checkbox-item">
            <input
              type="checkbox"
              id={`interview-${type}`}
              checked={formData.preferred_interview_type.includes(type)}
              onChange={() => handleCheckboxChange(type)}
            />
            <label htmlFor={`interview-${type}`} className="checkbox-label">
              {type}
            </label>
          </div>
        ))}
      </div>

      {/* Preferred Programming Language Dropdown */}
      <label>Preferred Programming Language</label>
      <select name="preferred_language" value={formData.preferred_language} onChange={handleSelectChange}>
        <option value="">Select Language</option>
        <option value="Python">Python</option>
        <option value="Java">Java</option>
        <option value="C++">C++</option>
        <option value="JavaScript">JavaScript</option>
      </select>

      {/* Submit and Cancel Buttons */}
      <div style={{ marginTop: '1rem' }}>
        <button type="submit" className="primaryButton">Save</button>
        <button type="button" className="secondaryButton" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

export default EditProfileForm;