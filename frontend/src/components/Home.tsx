import React from 'react'
import { useNavigate } from 'react-router-dom'

interface HomeProps {
  onLogout: () => void
}

const Home: React.FC<HomeProps> = ({ onLogout }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Welcome to CareerCracker</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Home
