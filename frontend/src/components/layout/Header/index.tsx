import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import styles from '@/styles/header.module.css'

interface HeaderProps {
  isOpen: boolean
}

const PAGE_TITLES: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/interview': 'Interview Practice',
  '/jobs': 'Jobs',
  '/profile': 'Profile',
  '/settings': 'Settings',
}

export default function Header({ isOpen }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const getPageTitle = () => {
    if (PAGE_TITLES[location.pathname]) {
      return PAGE_TITLES[location.pathname]
    }

    const pathSegments = Object.keys(PAGE_TITLES)
    const matchedRoute = pathSegments.find((route) =>
      location.pathname.startsWith(route)
    )

    return matchedRoute ? PAGE_TITLES[matchedRoute] : 'CareerCracker'
  }

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      logout()
      navigate('/signin')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        profileRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className={`${styles.header} ${isOpen ? styles.open : ''}`}>
      <div className={styles.headerLeft}>
        <h1>{getPageTitle()}</h1>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.searchContainer}>
          <input type="text" placeholder="Search..." />
          <i className="bx bx-search"></i>
        </div>

        <div className={styles.iconContainer}>
          <i className="bx bx-bell"></i>
          <span className={styles.badge}>2</span>
        </div>

        <div className={styles.iconContainer}>
          <i className="bx bx-envelope"></i>
          <span className={styles.badge}>3</span>
        </div>

        <div
          ref={profileRef}
          className={styles.profile}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <img src="/images/default-profile.png" alt="Profile" />
          <div className={styles.profileInfo}>
            <span className={styles.name}>User Name</span>
            <span className={styles.role}>Developer</span>
          </div>
        </div>

        {isDropdownOpen && (
          <div ref={dropdownRef} className={styles.profileDropdown}>
            <div className={styles.dropdownItem}>
              <i className="bx bx-user"></i>
              <span>Profile</span>
            </div>
            <div className={styles.dropdownItem}>
              <i className="bx bx-cog"></i>
              <span>Settings</span>
            </div>
            <div className={styles.dropdownItem} onClick={handleSignOut}>
              <i className="bx bx-log-out"></i>
              <span>Logout</span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}