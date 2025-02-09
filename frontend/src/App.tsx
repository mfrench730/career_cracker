import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Login from './components/Login'
import Signup from './components/Signup'
import Home from './components/Home'

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleSignupSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  return (
    <Router>
      <div>
        <nav style={{ marginBottom: '1rem', textAlign: 'center' }}>
          {!isAuthenticated && (
            <>
              <Link to="/login" style={{ marginRight: '1rem' }}>
                Login
              </Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
          {isAuthenticated && (
            <Link to="/" onClick={handleLogout}>
              Logout
            </Link>
          )}
        </nav>
        <Routes>
          <Route
            path="/login"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/signup"
            element={<Signup onSignupSuccess={handleSignupSuccess} />}
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Home onLogout={handleLogout} />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
