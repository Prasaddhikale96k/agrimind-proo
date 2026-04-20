'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, Menu, Leaf } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Crops', href: '/crops', icon: '🌾' },
  { label: 'Cattle', href: '/cattle', icon: '🐄' },
  { label: 'Weather', href: '/weather', icon: '🌤️' },
  { label: 'Finance', href: '/finance', icon: '💰' },
  { label: 'Reports', href: '/reports', icon: '📈' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
]

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white z-50 lg:hidden shadow-2xl"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-zinc-900">AgriMind</h1>
                    <span className="text-xs text-emerald-600 font-medium">Pro</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg touch-target flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <nav className="flex-1 p-3 overflow-y-auto">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              <div className="p-4 border-t">
                <p className="text-xs text-gray-400 text-center">
                  AgriMind Pro v1.0
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function MobileNavTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 hover:bg-gray-100 rounded-lg touch-target flex items-center justify-center"
      aria-label="Open menu"
    >
      <Menu className="w-6 h-6 text-gray-700" />
    </button>
  )
}