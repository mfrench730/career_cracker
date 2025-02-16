import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import styles from './Layout.module.css'

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={styles.layoutContainer}>
      <Sidebar isOpen={isOpen} onToggle={toggleSidebar} />
      <Header isOpen={isOpen} />
      <main
        className={`${styles.mainContainer} ${
          isOpen ? styles.sidebarOpen : ''
        }`}
      >
        <div className={styles.dashboardContent}>{children}</div>
      </main>
    </div>
  )
}

export default Layout
