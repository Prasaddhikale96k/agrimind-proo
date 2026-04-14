'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ArrowRight, Shield, Lock, CheckCircle, TrendingUp, Users, Star } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import confetti from 'canvas-confetti'

export default function FinalCTASection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { signInWithGoogle } = useAuth()

  const handleCTAClick = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#16a34a', '#4ade80', '#fbbf24', '#f59e0b'],
    })
    signInWithGoogle()
  }

  return (
    <section id="cta" ref={ref} className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #14532d 100%)', backgroundSize: '200% 200%', animation: 'gradient-shift 8s ease infinite' }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-64 h-64 bg-green-400/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-80 h-80 bg-green-300/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Start Growing Smarter Today
          </h2>
          <p className="text-xl text-green-200 max-w-2xl mx-auto mb-12">
            Join 12,000+ farmers who are already using AI to boost their yields and profits.
          </p>

          {/* CTA Button with pulse rings */}
          <div className="relative inline-block mb-12">
            {/* Pulse rings */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-white/30"
              animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-white/20"
              animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />

            <motion.button
              ref={buttonRef}
              onClick={handleCTAClick}
              className="relative px-12 py-5 bg-white text-green-700 rounded-2xl text-lg font-bold flex items-center gap-3 shadow-2xl shadow-green-900/30"
              whileHover={{ scale: 1.05, boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Security badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-16">
            <div className="flex items-center gap-2 text-green-200 text-sm">
              <Shield className="w-4 h-4" />
              <span>Bank-grade security</span>
            </div>
            <div className="flex items-center gap-2 text-green-200 text-sm">
              <Lock className="w-4 h-4" />
              <span>Encrypted data</span>
            </div>
            <div className="flex items-center gap-2 text-green-200 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="w-4 h-4 text-green-300" />
                <span className="text-3xl font-black text-white">12K+</span>
              </div>
              <p className="text-xs text-green-300">Active Farmers</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-green-300" />
                <span className="text-3xl font-black text-white">40%</span>
              </div>
              <p className="text-xs text-green-300">Avg. Cost Saved</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4 text-green-300" />
                <span className="text-3xl font-black text-white">4.9</span>
              </div>
              <p className="text-xs text-green-300">User Rating</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
