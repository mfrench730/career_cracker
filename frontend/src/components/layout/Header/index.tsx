import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import styles from '@/styles/header.module.css'
import { CircleUserRound } from 'lucide-react'
import { useProfile } from '@/context/ProfileContext'

// Props type for the Header component
interface HeaderProps {
  isOpen: boolean
}

// Map page paths to titles that show in the header
const PAGE_TITLES: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/interview': 'Interview Practice',
  '/jobs': 'Jobs',
  '/profile': 'Profile',
  '/settings': 'Settings',
}

export default function Header({ isOpen }: HeaderProps) {
  // Manage dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Refs to detect clicks outside dropdown/profile
  const dropdownRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, fetchProfile } = useProfile()

  // Fetch profile data when component loads
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Get the proper title for the current page
  const getPageTitle = () => {
    // If route is exactly in PAGE_TITLES, return its title
    if (PAGE_TITLES[location.pathname]) {
      return PAGE_TITLES[location.pathname]
    }

    // Otherwise check if the path starts with any of the keys
    const pathSegments = Object.keys(PAGE_TITLES)
    const matchedRoute = pathSegments.find((route) =>
      location.pathname.startsWith(route)
    )

    return matchedRoute ? PAGE_TITLES[matchedRoute] : 'CareerCracker'
  }

  // Log out and navigate to sign-in page
  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      logout()
      navigate('/signin')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Navigate to profile page when clicking "Profile" in dropdown
  const goToProfile = () => {
    setIsDropdownOpen(false)
    navigate('/profile')
  }

  // Close the dropdown if clicking outside of it
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
      {/* Left side: title */}
      <div className={styles.headerLeft}>
        <h1>{getPageTitle()}</h1>
      </div>

      {/* Right side: search, notifications, messages, user info */}
      <div className={styles.headerRight}>
        {/* Search input (currently not wired to any logic) */}
        <div className={styles.searchContainer}>
          <input type="text" placeholder="Search..." />
          <i className="bx bx-search"></i>
        </div>

        {/* Notification bell */}
        <div className={styles.iconContainer}>
          <i className="bx bx-bell"></i>
          <span className={styles.badge}>2</span>
        </div>

        {/* Messages icon */}
        <div className={styles.iconContainer}>
          <i className="bx bx-envelope"></i>
          <span className={styles.badge}>3</span>
        </div>

        {/* User profile button */}
        <div
          ref={profileRef}
          className={styles.profile}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <CircleUserRound size={32} strokeWidth={2} />
          <div className={styles.profileInfo}>
            <span className={styles.name}>{profile?.full_name}</span>
            <span className={styles.role}>{profile?.target_job_title}</span>
          </div>
        </div>

        {/* Dropdown menu */}
        {isDropdownOpen && (
          <div ref={dropdownRef} className={styles.profileDropdown}>
            <div className={styles.dropdownItem} onClick={goToProfile}>
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
