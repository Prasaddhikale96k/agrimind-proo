'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Sprout,
  Leaf,
  CloudSun,
  SprayCan,
  DollarSign,
  Bot,
  BarChart3,
  Settings,
  ChevronRight,
  LogOut,
  Wheat,
  PanelLeftClose,
  PanelLeft,
  Beef,
  Globe,
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
  { label: 'Cattle', href: '/cattle', icon: Beef },
  { label: 'Fassal Deal', href: '/fassal-deal', icon: Wheat, badge: 'NEW', highlight: true },
  { label: 'KisanGlobal', href: '/kisanglobal', icon: Globe, badge: 'EXPORT', highlight: true },
  { label: 'Weather Center', href: '/weather', icon: CloudSun },
  { label: 'Spray Schedule', href: '/spray', icon: SprayCan },
  { label: 'Financial Center', href: '/finance', icon: DollarSign },
  { label: 'AI Assistant', href: '/ai', icon: Bot },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
]

const COLLAPSED_WIDTH = 64
const EXPANDED_WIDTH = 240

const springTransition = {
  type: 'spring' as const,
  stiffness: 250,
  damping: 25,
}

interface CollapsibleSidebarProps {
  isOpen: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export default function CollapsibleSidebar({ isOpen, onMouseEnter, onMouseLeave }: CollapsibleSidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [internalHover, setInternalHover] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const isSidebarOpen = isOpen || internalHover

  const initials = user?.email
    ? user.email.split('@')[0].slice(0, 2).toUpperCase()
    : 'RK'
  const displayName = user?.email?.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Prasad'

  return (
    <div className="fixed left-0 top-0 h-screen z-50">
      {/* Hot zone trigger - 12px invisible area on the left edge */}
      <div
        className="absolute left-0 top-0 h-full w-[12px] -translate-x-full cursor-default"
        onMouseEnter={onMouseEnter}
      />

      {/* Sidebar */}
      <motion.aside
        ref={sidebarRef}
        className="h-full bg-white/95 backdrop-blur-md border-r border-slate-200 flex flex-col"
        initial={false}
        animate={{
          width: isSidebarOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
        }}
        transition={springTransition}
        onMouseEnter={() => {
          setInternalHover(true)
          onMouseEnter?.()
        }}
        onMouseLeave={() => {
          setInternalHover(false)
          onMouseLeave?.()
        }}
      >
        {/* Logo */}
        <div className="p-4 pb-3">
          <Link href="/dashboard" className="flex items-center justify-center">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              <Leaf className="w-6 h-6 text-white" />
            </motion.div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ ...springTransition, delay: 0.1 }}
                  className="ml-3"
                >
                  <h1 className="text-lg font-bold text-zinc-900">AgriMind</h1>
                  <span className="text-xs text-emerald-600 font-medium">Pro</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2 overflow-y-auto">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <Link href={item.href} className="relative block">
                    <motion.div
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                        ? 'bg-emerald-50 text-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                        : item.highlight
                          ? 'text-slate-700 hover:bg-slate-50 hover:text-emerald-600'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-zinc-900'
                        }`}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-emerald-600 rounded-r-full"
                          transition={springTransition}
                        />
                      )}
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-emerald-600' : ''}`} />
                      <AnimatePresence>
                        {isSidebarOpen && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ ...springTransition, delay: 0.12 }}
                            className="flex-1 whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {isSidebarOpen && item.badge && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ ...springTransition, delay: 0.15 }}
                          className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-md"
                        >
                          {item.badge}
                        </motion.span>
                      )}
                      <AnimatePresence>
                        {isSidebarOpen && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isActive ? 1 : 0.4 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.15 }}
                          >
                            <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-300'}`} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Divider */}
        <div className="px-4 py-2">
          <div className="h-px bg-slate-100" />
        </div>

        {/* Settings */}
        <div className="px-2 py-1">
          <Link href="/settings">
            <motion.div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-zinc-900 transition-all duration-200"
              whileHover={{ x: 2 }}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ ...springTransition, delay: 0.12 }}
                    className="flex-1 whitespace-nowrap"
                  >
                    Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
        </div>

        {/* User Profile */}
        <div className="p-3 mt-1">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all duration-200">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
              {initials}
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ ...springTransition, delay: 0.12 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-semibold text-zinc-900 truncate">{displayName}</p>
                  <p className="text-xs text-emerald-600 font-medium">Premium Plan</p>
                </motion.div>
              )}
            </AnimatePresence>
            {isSidebarOpen && (
              <motion.button
                onClick={signOut}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-slate-400" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.aside>
    </div>
  )
}
