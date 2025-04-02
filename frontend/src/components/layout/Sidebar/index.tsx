import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import styles from '@/styles/sidebar.module.css'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const NAVIGATION_ITEMS = [
  {
    path: '/dashboard',
    icon: 'bx-grid-alt',
    label: 'Dashboard',
  },
  {
    path: '/interview',
    icon: 'bx-code-alt',
    label: 'Interview Practice',
  },
  {
    path: '/jobs',
    icon: 'bx-briefcase',
    label: 'Jobs',
  },
]

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation()
  const { logout } = useAuth()

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles['logo-details']}>
        {isOpen && (
          <>
            <i className={`bx bxl-c-plus-plus ${styles.icon}`}></i>
            <div className={styles.logo_name}>CareerCracker</div>
          </>
        )}
        <i className="bx bx-menu" id="btn" onClick={onToggle}></i>
      </div>

      <ul className={styles['nav-list']}>
        <li>
          <Link to="#">
            <i className={`bx bx-search ${styles['search-icon']}`}></i>
            {isOpen && <input type="text" placeholder="Search..." />}
          </Link>
          <span className={styles.tooltip}>Search</span>
        </li>

        {NAVIGATION_ITEMS.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={location.pathname === item.path ? styles.active : ''}
            >
              <i className={`bx ${item.icon}`}></i>
              <span className={styles.links_name}>{item.label}</span>
            </Link>
            <span className={styles.tooltip}>{item.label}</span>
          </li>
        ))}

        <li className={styles.profile}>
          {isOpen ? (
            <>
              <div className={styles['profile-details']}>
                <img src="/images/default-profile.png" alt="profile" />
                <div className={styles.name_job}>
                  <div className={styles.name}>User Name</div>
                  <div className={styles.job}>Developer</div>
                </div>
              </div>
              <i className="bx bx-log-out" id="log_out" onClick={logout}></i>
            </>
          ) : (
            <i className="bx bx-log-out" id="log_out" onClick={logout}></i>
          )}
        </li>
      </ul>
    </div>
  )
}