'use client'

import { useRef, useEffect, useMemo } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { ArrowRight, Play, Check } from 'lucide-react'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 4 + Math.random() * 4,
  duration: 3 + Math.random() * 4,
  delay: Math.random() * 3,
  color: ['bg-green-300', 'bg-green-400', 'bg-green-200'][Math.floor(Math.random() * 3)],
}))

export default function HeroSection() {
  const { signInWithGoogle } = useAuth()
  const heroRef = useRef<HTMLDivElement>(null)
  const dashboardRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const dashboardY = useTransform(scrollYProgress, [0, 1], [0, -50])
  const dashboardRotateX = useTransform(scrollYProgress, [0, 1], [5, 0])

  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.3 })

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white pt-20">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          background: 'radial-gradient(ellipse at 20% 20%, rgba(34,197,94,0.12) 0%, transparent 60%)',
        }} />
        <div className="absolute top-0 left-0 w-full h-full" style={{
          background: 'radial-gradient(ellipse at 80% 80%, rgba(134,239,172,0.15) 0%, transparent 60%)',
        }} />
        {/* Grid dots */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-dots" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="#16a34a" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
      </div>

      {/* Floating Blobs */}
      <motion.div
        className="absolute top-20 -left-20 w-[600px] h-[600px] bg-green-200/30 rounded-full blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 -right-20 w-[400px] h-[400px] bg-green-300/20 rounded-full blur-2xl"
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-[200px] h-[200px] bg-gold/10 rounded-full blur-xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />

      {/* Floating Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${p.color}`}
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-8"
        >
          <motion.span
            className="w-2 h-2 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-sm font-medium text-green-700">AI-Powered Farm Management Platform</span>
          <motion.span
            className="w-2 h-2 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-[0.95] mb-8 tracking-tight"
        >
          <span className="block">Grow Smarter,</span>
          <span className="block">Farm Better</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-green-400 to-green-500 animate-gradient" style={{ backgroundSize: '200% 200%' }}>
            with AI
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          Transform your agricultural operation with intelligent automation, real-time soil analytics,
          AI crop health analysis, and complete financial management — all in one powerful platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <motion.button
            onClick={signInWithGoogle}
            className="relative group px-10 py-5 bg-green-600 text-white rounded-2xl text-lg font-bold overflow-hidden"
            whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(22,163,74,0.4)' }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Shimmer */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-2xl border-2 border-green-400 animate-pulse-ring" />
            <span className="relative flex items-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Start Growing for Free
              <ArrowRight className="w-5 h-5" />
            </span>
          </motion.button>

          <motion.button
            className="flex items-center gap-3 px-8 py-5 border-2 border-green-600 text-green-600 rounded-2xl text-lg font-medium hover:bg-green-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <Play className="w-5 h-5 fill-current" />
              <span className="absolute inset-0 rounded-full border border-green-400 animate-ping" />
            </div>
            Watch Demo
          </motion.button>
        </motion.div>

        {/* Trust badges */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 mb-16"
        >
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Free forever</span>
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> No credit card</span>
          <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Setup in 2 minutes</span>
        </motion.p>

        {/* Stats Row */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={statsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="flex flex-wrap items-center justify-center gap-6 mb-20"
        >
          {[
            { icon: '🌾', value: 12000, suffix: '+', label: 'Active Farms' },
            { icon: '📊', value: 98, suffix: '%', label: 'AI Accuracy' },
            { icon: '💰', value: 40, suffix: '%', label: 'Cost Saved' },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-6 py-4 bg-green-50 border border-green-200 rounded-2xl">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-2xl font-bold text-green-700">
                    {statsInView && <CountUp end={stat.value} duration={2} suffix={stat.suffix} separator="," />}
                  </p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
              {i < 2 && <div className="w-px h-12 bg-green-200" />}
            </div>
          ))}
        </motion.div>

        {/* Dashboard Preview Mockup */}
        <motion.div
          ref={dashboardRef}
          style={{ y: dashboardY, rotateX: dashboardRotateX }}
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5, ease: 'easeOut' }}
          className="relative max-w-4xl mx-auto perspective-[1000px]"
        >
          <div className="bg-white border border-green-200 rounded-3xl shadow-[0_50px_100px_rgba(22,163,74,0.15)] overflow-hidden">
            {/* Browser Frame */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white rounded-lg px-3 py-1.5 text-xs text-gray-400 text-center border border-gray-100">
                  agrimindpro.com/dashboard
                </div>
              </div>
            </div>
            {/* Mini Dashboard Content */}
            <div className="p-6 bg-green-50/30">
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Plant Health', value: '94%', color: 'text-green-600' },
                  { label: 'Soil pH', value: '7.6', color: 'text-green-600' },
                  { label: 'Humidity', value: '82%', color: 'text-blue-500' },
                  { label: 'Moisture', value: '65%', color: 'text-blue-500' },
                ].map((m, i) => (
                  <div key={i} className="bg-white rounded-xl p-3 border border-green-100">
                    <p className="text-[10px] text-gray-500 mb-1">{m.label}</p>
                    <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 bg-white rounded-xl p-4 border border-green-100">
                  <p className="text-xs font-medium text-gray-700 mb-3">Farm Overview</p>
                  <div className="flex gap-2">
                    {['PL-ODL', 'CL-ODL', 'PL-B'].map((id, i) => (
                      <div key={i} className="flex-1 bg-green-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] font-bold text-green-700">{id}</p>
                        <p className="text-xs text-green-600 font-semibold">{[94, 87, 72][i]}%</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-green-100">
                  <p className="text-xs font-medium text-gray-700 mb-3">Weather</p>
                  <p className="text-2xl mb-1">☀️</p>
                  <p className="text-lg font-bold text-gray-900">32°C</p>
                  <p className="text-[10px] text-gray-500">Sunny</p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Cards around mockup */}
          <motion.div
            className="absolute -left-16 top-1/4 bg-white rounded-xl p-3 shadow-lg border border-green-100 hidden lg:block"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <p className="text-xs font-medium text-gray-700">💧 Irrigation Alert</p>
            <p className="text-[10px] text-gray-500 mt-1">Plot PL-ODL needs water</p>
          </motion.div>

          <motion.div
            className="absolute -right-16 top-1/3 bg-white rounded-xl p-3 shadow-lg border border-green-100 hidden lg:block"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          >
            <p className="text-xs font-medium text-gray-700">🤖 AI Recommendation</p>
            <p className="text-[10px] text-gray-500 mt-1">Apply fertilizer today</p>
          </motion.div>

          <motion.div
            className="absolute -left-12 bottom-8 bg-white rounded-xl p-3 shadow-lg border border-green-100 hidden lg:block"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
          >
            <p className="text-xs font-bold text-green-600">₹1,56,000</p>
            <p className="text-[10px] text-gray-500">Net Profit ↑32%</p>
          </motion.div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </div>
    </section>
  )
}
