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
  const navbarBg = isAtTop ? 'bg-transparent' : 'bg-white/70 backdrop-blur-md border-b border-zinc-200/50 shadow-sm'
  const logoColor = isAtTop ? 'text-zinc-900' : 'text-green-700'
  const linkColor = isAtTop 
    ? 'text-zinc-900 hover:text-green-700' 
    : 'text-gray-600 hover:text-green-600'
  const linkActiveColor = isAtTop ? 'text-zinc-900' : 'text-green-700'

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: hideOnScroll ? -80 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 left-0 right-0 z-50 h-20 ${navbarBg}`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="#"
            className="flex items-center gap-2.5"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 ${
                isScrolled ? 'scale-95' : 'scale-100'
              } ${isScrolled ? 'bg-green-600' : 'bg-green-600'}`}
            >
              <Leaf className="w-5 h-5 text-white" />
            </motion.div>
            <span className={`text-lg font-bold ${logoColor}`}>AgriMind</span>
            <span className={`text-xs font-semibold -mt-3 ${linkColor.replace('hover:text-green-700', '')}`}>Pro</span>
          </motion.a>

          {/* Center Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link, i) => (
              <motion.button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg ${activeSection === link.href.slice(1) ? linkActiveColor : linkColor}`}
              >
                <span className="relative">
                  {link.label}
                  <motion.span
                    className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-0.5 bg-green-500 rounded-full"
                    initial={{ width: 0, left: '50%' }}
                    whileHover={{ width: '80%', left: '10%' }}
                    transition={{ duration: 0.2 }}
                  />
                </span>
                {activeSection === link.href.slice(1) && (
                  <motion.div
                    layoutId="activeNavDot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </nav>

          {/* Right Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <motion.button
              onClick={signInWithGoogle}
              className={`px-4 py-2 text-sm font-medium ${linkColor}`}
              whileHover={{ scale: 1.02 }}
            >
              Sign In
            </motion.button>
            <motion.button
              onClick={signInWithGoogle}
              className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md"
              whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(22,163,74,0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              Get Started Free
              <span>→</span>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="text-left text-lg font-medium text-gray-700 hover:text-green-600 py-3 border-b border-gray-100"
                >
                  {link.label}
                </button>
              ))}
              <button
                  onClick={() => { signInWithGoogle(); setMobileOpen(false); }}
                  className="mt-4 px-6 py-3 bg-green-600 text-white rounded-xl font-medium"
                >
                  Get Started Free
                </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
