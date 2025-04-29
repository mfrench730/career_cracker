import React, { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';


type Profile = {
    full_name: string;
    major: string;
    education_level: string;
    experience_level: string;
    target_job_title: string;
    preferred_interview_type: string[];
    preferred_language: string;
  };
  
  interface EditProfileFormProps {
    profile: Profile;
    onClose: () => void;
  }


const EditProfileForm: React.FC<EditProfileFormProps> = ({ profile, onClose }) => {
  const { updateProfile } = useProfile();
  const [formData, setFormData] = useState<Profile>({
    full_name: profile.full_name || '',
    major: profile.major || '',
    education_level: profile.education_level || '',
    experience_level: profile.experience_level || '',
    target_job_title: profile.target_job_title ?? '',
    preferred_interview_type: profile.preferred_interview_type ?? [],
    preferred_language: profile.preferred_language ?? '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Handle array input for preferred_interview_type
    if (name === 'preferred_interview_type') {
      setFormData((prev: Profile) => ({
        ...prev,
        [name]: value.split(',').map(item => item.trim()),
      }));
    } else {
      setFormData((prev: Profile) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateProfile(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Profile</h2>

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
        value={formData.preferred_interview_type}
        onChange={handleChange}
      />

      <label>Preferred Language</label>
      <input name="preferred_language" value={formData.preferred_language} onChange={handleChange} />

      <div style={{ marginTop: '1rem' }}>
        <button type="submit" className="primaryButton">Save</button>
        <button type="button" className="secondaryButton" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

export default EditProfileForm;