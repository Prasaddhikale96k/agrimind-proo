'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Sprout,
  Leaf,
  CloudSun,
  Droplets,
  SprayCan,
  DollarSign,
  Bot,
  BarChart3,
  Settings,
  User,
  ChevronRight,
  LogOut,
  Wheat,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

type NavItem = {
  label: string
  href: string
  icon: typeof LayoutDashboard
  badge?: string
  highlight?: boolean
  count?: number
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Crop Management', href: '/crops', icon: Sprout },
  { label: 'Fassal Deal', href: '/fassal-deal', icon: Wheat, badge: 'NEW', highlight: true },
  { label: 'Weather Center', href: '/weather', icon: CloudSun },
  { label: 'Irrigation', href: '/irrigation', icon: Droplets },
  { label: 'Spray Schedule', href: '/spray', icon: SprayCan },
  { label: 'Financial Center', href: '/finance', icon: DollarSign },
  { label: 'AI Assistant', href: '/ai', icon: Bot },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const initials = user?.email
    ? user.email.split('@')[0].slice(0, 2).toUpperCase()
    : 'RK'
  const displayName = user?.email?.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Rajesh Kumar'

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-white border-r border-gray-100 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center"
          >
            <Leaf className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold text-dark">AgriMind</h1>
            <span className="text-xs text-primary font-medium">Pro</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link href={item.href} className="relative">
                  <motion.div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : item.highlight
                        ? 'text-primary hover:bg-primary/5'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-accent text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {('count' in item) && (item as any).count && (item as any).count > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-warning text-white rounded-full">
                        {(item as any).count}
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-gray-300'}`} />
                  </motion.div>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Settings */}
      <div className="px-3 py-2">
        <Link href="/settings">
          <motion.div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            whileHover={{ x: 4 }}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </motion.div>
        </Link>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-dark truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">Premium Plan</p>
          </div>
          <motion.button
            onClick={signOut}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Sign out"
          >
            <LogOut className="w-4 h-4 text-gray-400" />
          </motion.button>
        </div>
      </div>
    </aside>
  )
}
