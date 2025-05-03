import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import styles from '@/styles/layout.module.css'

// Layout wraps the entire app UI (sidebar + header + content)
const Layout = ({ children }: { children: React.ReactNode }) => {
  // State to track whether the sidebar is open or collapsed
  const [isOpen, setIsOpen] = useState(false)

  // Toggles sidebar open/close
  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar component with toggle control */}
      <Sidebar isOpen={isOpen} onToggle={toggleSidebar} />

      {/* Main content area shifts over if sidebar is open */}
      <div
        className={
          styles.mainContainer + (isOpen ? ` ${styles.sidebarOpen}` : '')
        }
      >
        {/* Header stays at the top */}
        <Header isOpen={isOpen} />

        {/* Content of the current page */}
        <div className={styles.dashboardContent}>{children}</div>
      </div>
    </div>
  )
}

export default Layout
