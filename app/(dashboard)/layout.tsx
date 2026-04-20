'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CollapsibleSidebar from '@/components/layout/CollapsibleSidebar'
import Header from '@/components/layout/Header'
import MobileNav, { MobileNavTrigger } from '@/components/layout/MobileNav'

const COLLAPSED_WIDTH = 64
const EXPANDED_WIDTH = 240

const pageTitleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/crops': 'Crop Management',
  '/cattle': 'Cattle Management',
  '/soil': 'Soil Monitoring',
  '/weather': 'Weather Center',
  '/spray': 'Spray Schedule',
  '/fertilization': 'Fertilization Planner',
  '/finance': 'Financial Center',
  '/alerts': 'Alerts Center',
  '/ai': 'AI Assistant',
  '/reports': 'Reports & Analytics',
  '/settings': 'Settings',
  '/kisanglobal': 'KisanGlobal Export Hub',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const title = pageTitleMap[pathname] || 'Dashboard'

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <CollapsibleSidebar
        isOpen={sidebarOpen}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      />
      
      <div
        className="transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] lg:ml-[64px] xl:ml-[64px] 2xl:ml-[64px]"
        style={{ marginLeft: isMobile ? 0 : (sidebarOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH) }}
      >
        <Header 
          title={title} 
          onMenuClick={() => setMobileMenuOpen(true)}
          hideSidebarToggle={isMobile}
        />
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
