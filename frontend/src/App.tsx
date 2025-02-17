// src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Dashboard from './pages/dashboard/Dashboard'
import Interview from './pages/interview/AiInterview'
import Jobs from './pages/jobs/Jobs'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import { useAuth } from './context/AuthContext'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  return <Layout>{children}</Layout>
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

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
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

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview/*"
        element={
          <ProtectedRoute>
            <Interview />
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

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
