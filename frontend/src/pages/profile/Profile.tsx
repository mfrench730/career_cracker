import { useEffect, useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import Modal from '@/components/profile/Modal';
import EditProfileForm from '@/components/profile/EditProfileForm';
import '@/styles/profile.css';

const Profile = () => {
  const { profile, fetchProfile } = useProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Controls modal visibility

  // Fetch profile on component mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Display loading state if profile hasn't loaded yet
  if (!profile) {
    return (
      <div className="dashboardContainer">
        <div className="infoCard">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading profile information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboardContainer">
      {/* Profile Header */}
      <div className="welcomeHeader animate">
        <div>
          <h1 className="welcomeTitle">Professional Profile</h1>
          <p className="welcomeSubtitle">
            View and manage your professional information to maximize your interview success
          </p>
        </div>
        {/* Button to open the edit modal */}
        <button className="ctaButton" onClick={() => setIsEditModalOpen(true)}>
          Edit Profile
        </button>
      </div>

      {/* Personal Info Section */}
      <div className="infoCard animate delay1">
        <h2 className="sectionHeading">Personal Information</h2>
        <div className="profileDetails">
          <div className="profileRow">
            <div className="profileField">
              <span className="profileLabel">Full Name</span>
              <span className="profileValue">{profile.full_name}</span>
            </div>
            <div className="profileField">
              <span className="profileLabel">Major</span>
              <span className="profileValue">{profile.major}</span>
            </div>
          </div>
          <div className="profileRow">
            <div className="profileField">
              <span className="profileLabel">Education Level</span>
              <span className="profileValue">{profile.education_level}</span>
            </div>
            <div className="profileField">
              <span className="profileLabel">Experience Level</span>
              <span className="profileValue">{profile.experience_level}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Career Preferences Section */}
      <div className="infoCard animate delay2">
        <h2 className="sectionHeading">Career Preferences</h2>
        <div className="profileDetails">
          <div className="profileRow">
            <div className="profileField">
              <span className="profileLabel">Target Job Title</span>
              <span className="profileValue">{profile.target_job_title}</span>
            </div>
          </div>
          <div className="profileRow">
            <div className="profileField">
              <span className="profileLabel">Preferred Interview Type</span>
              <span className="profileValue">{profile.preferred_interview_type.join(', ')}</span>
            </div>
            <div className="profileField">
              <span className="profileLabel">Preferred Language</span>
              <span className="profileValue">{profile.preferred_language}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="ctaSection animate delay3">
        <h3 className="ctaTitle">Ready to Enhance Your Profile?</h3>
        <p className="ctaText">
          Complete your profile to get personalized interview recommendations and improve your chances of success.
        </p>
        <div className="buttonGroup">
          <button className="primaryButton">Update Skills</button>
          <button className="secondaryButton">View Recommendations</button>
        </div>
      </div>

      {/* Modal for editing profile */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <EditProfileForm
          profile={{
            full_name: profile.full_name || '',
            major: profile.major || '',
            education_level: profile.education_level || '',
            experience_level: profile.experience_level || '',
            target_job_title: profile.target_job_title ?? '',
            preferred_interview_type: profile.preferred_interview_type ?? [],
            preferred_language: profile.preferred_language ?? '',
          }}
          onClose={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Profile;
