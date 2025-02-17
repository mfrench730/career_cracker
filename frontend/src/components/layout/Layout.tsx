import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import styles from '@/styles/layout.module.css'

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={styles.layoutContainer}>
      <Sidebar isOpen={isOpen} onToggle={toggleSidebar} />
      <div
        className={
          styles.mainContainer + (isOpen ? ` ${styles.sidebarOpen}` : '')
        }
      >
        <Header isOpen={isOpen} />
        <div className={styles.dashboardContent}>{children}</div>
      </div>
    </div>
  )
}

export default Layout
