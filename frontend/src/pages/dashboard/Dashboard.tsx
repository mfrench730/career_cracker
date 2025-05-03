import { useState, useEffect } from 'react'
import { useProfile } from '@/context/ProfileContext'
import styles from '@/styles/dashboard.module.css'

// Main Dashboard component
const Dashboard = () => {
  // Grab profile info and loading state from context
  const { profile, fetchProfile, isLoading } = useProfile()

  // For handling hover animation on feature cards
  const [animateFeature, setAnimateFeature] = useState<string | null>(null)

  // Load profile when component mounts
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // These are the main features we show on the dashboard
  const features = [
    {
      id: 'interviews',
      title: 'AI-Powered Interviews',
      description:
        'Practice with custom interview questions tailored specifically to your career goals.',
      icon: '🎯',
    },
    {
      id: 'feedback',
      title: 'Smart Feedback',
      description:
        'Receive detailed insights on your responses with actionable tips to improve.',
      icon: '📝',
    },
    {
      id: 'jobs',
      title: 'Job Exploration',
      description:
        'Discover career paths that match your skills and learn about requirements.',
      icon: '🔍',
    },
    {
      id: 'progress',
      title: 'Performance Tracking',
      description:
        'Monitor your interview skills growth with detailed analytics and progress reports.',
      icon: '📊',
    },
  ]

  // These are the 4 steps we show to explain the process visually
  const processSteps = [
    { icon: '👤', label: 'Create Profile' },
    { icon: '🎯', label: 'Practice Interviews' },
    { icon: '📝', label: 'Get Feedback' },
    { icon: '🚀', label: 'Land Your Dream Job' },
  ]

  // If the profile is still loading, just show a loading message
  if (isLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.welcomeHeader}>
          <h2 className={styles.welcomeTitle}>Loading...</h2>
        </div>
      </div>
    )
  }

  // Main dashboard UI
  return (
    <div className={styles.dashboardContainer}>
      {/* Welcome header section with call to action button */}
      <div className={`${styles.welcomeHeader} ${styles.animate}`}>
        <div>
          <h1 className={styles.welcomeTitle}>
            {profile
              ? `Welcome back, ${profile.username}!`
              : 'Welcome to CareerCracker!'}
          </h1>
          <p className={styles.welcomeSubtitle}>
            Your AI-powered interview agent designed to help you prepare for
            your dream career through personalized practice and feedback
          </p>
        </div>
        {/* Button to start interview */}
        <button
          className={styles.ctaButton}
          onClick={() => (window.location.href = '/interview')}
        >
          Start Interview
        </button>
      </div>

      {/* Section introducing CareerCracker and how it works */}
      <div className={`${styles.infoCard} ${styles.animate} ${styles.delay1}`}>
        <h2 className={styles.sectionHeading}>Meet CareerCracker</h2>
        <p
          style={{
            fontSize: '1.1rem',
            lineHeight: '1.6',
            color: 'var(--text-primary)',
            marginBottom: '1.5rem',
          }}
        >
          CareerCracker is an innovative interview preparation platform designed
          by Professor Myers' Software Engineering students. Our mission is to
          help you practice for interviews, explore job opportunities, and
          receive expert feedback to excel in your career journey.
        </p>

        {/* Visual representation of the step-by-step process */}
        <div className={styles.processContainer}>
          {processSteps.map((step, index) => (
            <div key={index} className={styles.processStep}>
              <div
                className={`${styles.processIcon} ${
                  index === 1 ? styles.pulsateIcon : ''
                }`}
              >
                {step.icon}
              </div>
              <div className={styles.processLabel}>{step.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features section */}
      <h2
        className={`${styles.sectionHeading} ${styles.animate} ${styles.delay2}`}
      >
        Key Features
      </h2>

      {/* Display each feature in a grid */}
      <div className={styles.featureGrid}>
        {features.map((feature, index) => (
          <div
            key={feature.id}
            className={`${styles.featureCard} ${styles.animate} ${
              styles[`delay${index + 1}`]
            }`}
            // Add hover animation effect
            onMouseEnter={() => setAnimateFeature(feature.id)}
            onMouseLeave={() => setAnimateFeature(null)}
          >
            <span className={styles.featureIcon}>{feature.icon}</span>
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <p className={styles.featureDescription}>{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Final call-to-action section */}
      <div
        className={`${styles.ctaSection} ${styles.animate} ${styles.delay4}`}
      >
        <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
        <p className={styles.ctaText}>
          Jump right into interview practice or explore job opportunities to
          prepare for your career journey. CareerCracker is here to help you
          succeed in landing your dream job!
        </p>
        <div className={styles.buttonGroup}>
          {/* Button to go to interview page */}
          <button
            className={styles.primaryButton}
            onClick={() => (window.location.href = '/interview')}
          >
            Start Interview
          </button>
          {/* Button to go to jobs page */}
          <button
            className={styles.secondaryButton}
            onClick={() => (window.location.href = '/jobs')}
          >
            Explore Jobs
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
