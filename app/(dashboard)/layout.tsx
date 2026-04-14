'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import CollapsibleSidebar from '@/components/layout/CollapsibleSidebar'
import Header from '@/components/layout/Header'

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
  const title = pageTitleMap[pathname] || 'Dashboard'

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      <CollapsibleSidebar
        isOpen={sidebarOpen}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      />
      <div
        className="transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ marginLeft: sidebarOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
      >
        <Header title={title} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
