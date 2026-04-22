'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Menu, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Analytics', href: '#dashboard-preview' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const { signInWithGoogle } = useAuth()
  const lastScrollY = useRef(0)
  const [hideOnScroll, setHideOnScroll] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsScrolled(currentScrollY > 20)
      setHideOnScroll(currentScrollY > lastScrollY.current && currentScrollY > 100)
      lastScrollY.current = currentScrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )

    navLinks.forEach((link) => {
      const el = document.querySelector(link.href)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const scrollTo = (href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  const isAtTop = !isScrolled
  
  const bgColor = isAtTop 
    ? 'bg-white/80 backdrop-blur-md' 
    : 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100'
  
  const logoColor = 'text-gray-900'
  const linkColor = 'text-gray-600 hover:text-emerald-700'
  const linkActiveColor = 'text-emerald-700'

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: hideOnScroll ? -80 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 left-0 right-0 z-50 ${bgColor}`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo - Far Left */}
          <motion.a
            href="#"
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-baseline">
              <span className="text-lg font-bold text-gray-900">AgriMind</span>
              <span className="text-xs font-semibold text-emerald-600 ml-0.5">Pro</span>
            </div>
          </motion.a>

          {/* Center Nav Links - Perfectly Centered with Generous Spacing */}
          <nav className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-8">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`relative text-sm font-medium py-2 px-1 transition-colors ${
                    activeSection === link.href.slice(1) ? linkActiveColor : linkColor
                  }`}
                >
                  {link.label}
                  {activeSection === link.href.slice(1) && (
                    <motion.div
                      layoutId="activeNavDot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </nav>

          {/* Right Buttons - Sign In + Get Started */}
          <div className="hidden lg:flex items-center gap-4">
            <motion.button
              onClick={signInWithGoogle}
              className="px-1 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.button>
            <motion.button
              onClick={signInWithGoogle}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.03, boxShadow: '0 10px 25px rgba(5, 150, 105, 0.35)' }}
              whileTap={{ scale: 0.97 }}
            >
              Get Started Free
              <span className="text-lg leading-none">→</span>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -mr-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-20 px-6 lg:hidden"
          >
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="text-left text-lg font-medium text-gray-700 hover:text-emerald-600 py-4 border-b border-gray-100"
                >
                  {link.label}
                </button>
              ))}
              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={() => { signInWithGoogle(); setMobileOpen(false); }}
                  className="w-full px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { signInWithGoogle(); setMobileOpen(false); }}
                  className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium"
                >
                  Get Started Free
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}