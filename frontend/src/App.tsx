import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { InterviewProvider } from './context/InterviewContext'
import { ProfileProvider } from './context/ProfileContext'
import Layout from './components/layout/Layout'
import Dashboard from './pages/dashboard/Dashboard'
import ProfilePage from './pages/profile/Profile'
import Interview from './pages/interview/AiInterview'
import Jobs from './pages/jobs/Jobs'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import { useAuth } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  return (
    <ProfileProvider>
      <Layout>{children}</Layout>
    </ProfileProvider>
  )
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

const AppRoutes = () => (
  <Routes>
    <Route
      path="/signin"
      element={
        <PublicRoute>
          <SignIn />
        </PublicRoute>
      }
    />
    <Route
      path="/signup"
      element={
        <PublicRoute>
          <SignUp />
        </PublicRoute>
      }
    />

    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <ProfileProvider>
            <Dashboard />
          </ProfileProvider>
        </ProtectedRoute>
      }
    />
    <Route
      path="/interview/*"
      element={
        <ProtectedRoute>
          <InterviewProvider>
            <Interview />
          </InterviewProvider>
        </ProtectedRoute>
      }
    />
    <Route
      path="/jobs"
      element={
        <ProtectedRoute>
          <Jobs />
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      }
    />

    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
)

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
