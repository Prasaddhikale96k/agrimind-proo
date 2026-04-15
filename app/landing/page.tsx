'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, ArrowRight, Sprout, BarChart3, Bot, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import gsap from 'gsap'

const features = [
  { icon: Sprout, title: 'Crop Intelligence', desc: 'AI-powered health monitoring and yield predictions' },
  { icon: BarChart3, title: 'Financial Analytics', desc: 'Track expenses, income, and ROI per plot' },
  { icon: Bot, title: 'AI Assistant', desc: 'Get expert farming advice powered by GPT-4' },
  { icon: Shield, title: 'Soil Monitoring', desc: 'Real-time NPK, pH, and moisture tracking' },
]

export default function LandingPage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const router = useRouter()
  const [showEntrance, setShowEntrance] = useState(false)

  const heroRef = useRef<HTMLDivElement>(null)
  const leafRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user && !loading) {
      setShowEntrance(true)
    }
  }, [user, loading])

  useEffect(() => {
    if (showEntrance) {
      const tl = gsap.timeline({
        onComplete: () => router.push('/dashboard'),
      })
      tl.to(mapRef.current, {
        scale: 3,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.inOut',
      })
    }
  }, [showEntrance, router])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2

      gsap.to(leafRef.current, {
        x: x * 30,
        y: y * 30,
        rotation: x * 5,
        duration: 0.8,
        ease: 'power2.out',
      })

      gsap.to(mapRef.current, {
        x: x * -15,
        y: y * -15,
        duration: 0.8,
        ease: 'power2.out',
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6F7] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Leaf className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    )
  }

  if (showEntrance) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F5F6F7] flex items-center justify-center overflow-hidden">
        <div ref={mapRef} className="relative w-[300px] h-[300px] rounded-3xl overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 border border-[#E2E8F0] shadow-glass">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Leaf className="w-12 h-12 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-subtle">Loading your farm...</p>
            </div>
          </div>
          <svg className="absolute inset-0 w-full h-full opacity-10">
            <defs>
              <pattern id="entrance-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#00B894" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#entrance-grid)" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F5F6F7] relative overflow-hidden">
      {/* GSAP Parallax Background Elements */}
      <div ref={leafRef} className="absolute top-32 right-32 w-48 h-48 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M50 10 C20 10 10 40 10 60 C10 80 30 90 50 90 C70 90 90 80 90 60 C90 40 80 10 50 10Z" fill="#00B894" />
          <path d="M50 10 L50 90" stroke="#009E7F" strokeWidth="1" fill="none" />
        </svg>
      </div>

      <div ref={mapRef} className="absolute bottom-20 left-20 w-64 h-64 opacity-5 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="10" y="10" width="35" height="40" rx="4" fill="#00B894" />
          <rect x="55" y="15" width="30" height="45" rx="4" fill="#2ecc71" />
          <rect x="15" y="60" width="40" height="25" rx="4" fill="#f39c12" />
        </svg>
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between px-8 py-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00B894] to-[#00D4A0] rounded-xl flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1A1A1B]">AgriMind</h1>
            <span className="text-xs text-[#00B894] font-medium">Pro</span>
          </div>
        </div>
        <motion.button
          onClick={signInWithGoogle}
          className="px-5 py-2.5 bg-[#1A1A1B] text-white rounded-xl text-sm font-medium hover:bg-[#2A2A2B] transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Sign In
        </motion.button>
      </motion.nav>

      {/* Hero Section */}
      <div ref={heroRef} className="relative z-10 max-w-5xl mx-auto px-8 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-[#E2E8F0] rounded-full text-xs font-medium text-subtle mb-6">
            <span className="w-2 h-2 bg-[#00B894] rounded-full animate-pulse" />
            Trusted by 500+ farmers across Nashik
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-6xl font-bold text-[#1A1A1B] leading-tight mb-6"
        >
          The Future of Farming,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B894] to-[#00D4A0]">
            Rooted in Intelligence
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg text-subtle max-w-2xl mx-auto mb-10"
        >
          AI-powered crop monitoring, soil analysis, and financial tracking.
          Everything you need to grow smarter, not harder.
        </motion.p>

        {/* Google Auth Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          {/* Sign In Button */}
          <motion.button
            onClick={signInWithGoogle}
            className="flex items-center gap-3 px-8 py-4 bg-white border border-[#E2E8F0] rounded-2xl text-sm font-medium text-[#1A1A1B] hover:shadow-glass hover:border-gray-300 transition-all duration-200"
            whileHover={{ scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)' }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
            <ArrowRight className="w-4 h-4" />
          </motion.button>
          <p className="text-xs text-label">Free to start • No credit card required</p>

          {/* Go to Dashboard Button */}
          <motion.button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-6 py-3 text-emerald-600 text-sm font-medium hover:bg-emerald-50 rounded-xl transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowRight className="w-4 h-4" />
            Go to Dashboard
          </motion.button>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 max-w-5xl mx-auto px-8 pb-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              className="glass-card p-6 hover:shadow-glass transition-all duration-200"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-[#00B894]" />
              </div>
              <h3 className="text-sm font-semibold text-[#1A1A1B] mb-1">{feature.title}</h3>
              <p className="text-xs text-subtle">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-[#E2E8F0] py-8">
        <p className="text-center text-xs text-label">
          Built for the farmers of Nashik • AgriMind Pro 2026
        </p>
      </div>
    </div>
  )
}
