'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Lock, Map, Bot, Lightbulb, TrendingUp } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Lock,
    title: 'Sign In with Google',
    description: 'One-click authentication. No passwords to remember, no forms to fill. Just your Google account and you\'re in.',
    visual: (
      <div className="w-full h-32 bg-white rounded-2xl border border-green-200 flex items-center justify-center gap-3 p-4">
        <svg className="w-8 h-8" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span className="text-sm font-medium text-gray-700">Continue with Google</span>
      </div>
    ),
  },
  {
    number: '02',
    icon: Map,
    title: 'Map Your Farm Plots',
    description: 'Draw your field boundaries on an interactive map. Add plot names, sizes, and crop types in seconds.',
    visual: (
      <div className="w-full h-32 bg-green-100 rounded-2xl border border-green-200 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#16a34a" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#map-grid)" />
          </svg>
        </div>
        <div className="absolute top-3 left-3 w-16 h-12 bg-green-300/60 rounded-lg border-2 border-green-600 border-dashed" />
        <div className="absolute top-6 right-6 w-20 h-14 bg-green-400/50 rounded-lg border-2 border-green-700 border-dashed" />
        <div className="absolute bottom-3 left-12 w-14 h-10 bg-yellow-200/60 rounded-lg border-2 border-yellow-600 border-dashed" />
      </div>
    ),
  },
  {
    number: '03',
    icon: Bot,
    title: 'AI Takes Over Analysis',
    description: 'Our AI engine immediately starts analyzing your soil data, weather patterns, and crop health metrics.',
    visual: (
      <div className="w-full h-32 bg-gradient-to-br from-green-900 to-green-700 rounded-2xl flex items-center justify-center relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-green-400/10"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <Bot className="w-12 h-12 text-green-300 relative z-10" />
        <div className="absolute bottom-2 left-3 right-3 flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="flex-1 h-1.5 bg-green-400 rounded-full"
              animate={{ scaleX: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    number: '04',
    icon: Lightbulb,
    title: 'Act on AI Recommendations',
    description: 'Get clear, actionable insights — when to irrigate, what fertilizer to apply, and the best harvest window.',
    visual: (
      <div className="w-full h-32 bg-white rounded-2xl border border-green-200 p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <Lightbulb className="w-3.5 h-3.5 text-green-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Apply NPK 19:19:19 today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Irrigate Plot B tomorrow AM</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Harvest in 12 days</span>
        </div>
      </div>
    ),
  },
  {
    number: '05',
    icon: TrendingUp,
    title: 'Watch Your Profits Grow',
    description: 'Track your financial growth in real-time. See ROI per plot, cost savings, and yield improvements.',
    visual: (
      <div className="w-full h-32 bg-white rounded-2xl border border-green-200 p-3 flex items-end gap-2">
        {[30, 45, 35, 60, 50, 75, 65, 90, 80, 100].map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 bg-gradient-to-t from-green-600 to-green-400 rounded-t-md"
            style={{ height: `${h}%` }}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.08 }}
          />
        ))}
      </div>
    ),
  },
]

export default function HowItWorksSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="how-it-works" ref={ref} className="py-24 bg-green-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-300/10 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Up and Running in Minutes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Five simple steps from signup to smarter farming
          </p>
          <motion.div
            className="w-20 h-1 bg-green-500 mx-auto mt-6 rounded-full"
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>

        {/* Vertical connecting line */}
        <div className="absolute left-1/2 top-48 bottom-48 w-px hidden lg:block">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <line x1="0" y1="0" x2="0" y2="100%" stroke="#22c55e" strokeWidth="2" strokeDasharray="8 8" />
          </svg>
        </div>

        {/* Steps */}
        <div className="relative">
          {steps.map((step, i) => {
            const isLeft = i % 2 === 0
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className={`flex flex-col lg:flex-row items-center gap-8 mb-16 last:mb-0 ${
                  isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content side */}
                <div className={`flex-1 ${isLeft ? 'lg:text-right' : 'lg:text-left'}`}>
                  <div className={`flex items-center gap-4 mb-4 ${isLeft ? 'lg:justify-end' : 'lg:justify-start'}`}>
                    <motion.div
                      className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center"
                      whileHover={{ rotate: 10, scale: 1.1 }}
                    >
                      <step.icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <div>
                      <span className="text-5xl font-black text-green-200">{step.number}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed max-w-md">{step.description}</p>
                </div>

                {/* Center dot */}
                <div className="hidden lg:flex w-12 h-12 bg-green-600 rounded-full items-center justify-center flex-shrink-0 z-10 shadow-lg shadow-green-600/30">
                  <span className="text-white font-bold text-sm">{step.number}</span>
                </div>

                {/* Visual side */}
                <div className="flex-1 w-full max-w-sm">
                  {step.visual}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
