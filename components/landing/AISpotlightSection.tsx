'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { MessageSquare, Image, Zap, Send, Scan, ArrowRight, Cpu } from 'lucide-react'

const circuitPaths = [
  'M0,50 L100,50 L100,100 L200,100 L200,50 L300,50',
  'M0,150 L50,150 L50,200 L150,200 L150,150 L300,150',
  'M0,250 L80,250 L80,300 L180,300 L180,250 L300,250',
  'M0,350 L120,350 L120,400 L250,400 L250,350 L300,350',
]

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 3,
  duration: 4 + Math.random() * 6,
  delay: Math.random() * 4,
}))

export default function AISpotlightSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [chatStep, setChatStep] = useState(0)
  const [scanProgress, setScanProgress] = useState(0)

  useEffect(() => {
    if (!inView) return
    const chatInterval = setInterval(() => {
      setChatStep((prev) => (prev + 1) % 4)
    }, 2500)
    return () => clearInterval(chatInterval)
  }, [inView])

  useEffect(() => {
    if (!inView) return
    const scanInterval = setInterval(() => {
      setScanProgress((prev) => (prev >= 100 ? 0 : prev + 2))
    }, 50)
    return () => clearInterval(scanInterval)
  }, [inView])

  return (
    <section id="ai-spotlight" ref={ref} className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)' }}>
      {/* Circuit lines background */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        {circuitPaths.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke="#4ade80"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </svg>

      {/* Floating particle dots */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-green-400/30"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
        />
      ))}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-800/50 rounded-full mb-6 border border-green-700/50">
            <Cpu className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-300">Powered by Advanced AI</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Meet Your AI Farm Manager
          </h2>
          <p className="text-xl text-green-200 max-w-2xl mx-auto">
            Three superpowers that transform how you farm
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Natural Language Chat */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-green-950/60 backdrop-blur-sm rounded-3xl border border-green-800/50 overflow-hidden"
          >
            <div className="p-6 border-b border-green-800/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-800 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Natural Language Chat</h3>
                  <p className="text-xs text-green-400">Ask anything in your language</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <AnimatePresence mode="wait">
                {chatStep >= 0 && (
                  <motion.div
                    key="user-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-green-800 rounded-xl p-3 rounded-tr-none max-w-[85%]"
                  >
                    <p className="text-xs text-green-200">When should I harvest my paddy?</p>
                  </motion.div>
                )}
                {chatStep >= 1 && (
                  <motion.div
                    key="ai-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-green-900/80 rounded-xl p-3 rounded-tl-none max-w-[90%] ml-auto border border-green-700/50"
                  >
                    <p className="text-xs text-white">Based on your plot PL-ODL data, your paddy is at 85% maturity. Best harvest window: 7-10 days from now. Moisture content should be below 20%.</p>
                  </motion.div>
                )}
                {chatStep >= 2 && (
                  <motion.div
                    key="user-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-green-800 rounded-xl p-3 rounded-tr-none max-w-[85%]"
                  >
                    <p className="text-xs text-green-200">What&apos;s the expected yield?</p>
                  </motion.div>
                )}
                {chatStep >= 3 && (
                  <motion.div
                    key="ai-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-green-900/80 rounded-xl p-3 rounded-tl-none max-w-[90%] ml-auto border border-green-700/50"
                  >
                    <p className="text-xs text-white">Estimated yield: 28-32 quintals/acre. That&apos;s 15% above your district average based on current conditions.</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex items-center gap-2 bg-green-900/50 rounded-xl px-3 py-2 border border-green-800/50">
                <span className="text-[10px] text-green-500">Type a question...</span>
                <Send className="w-3 h-3 text-green-500 ml-auto" />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Image Disease Detection */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-green-950/60 backdrop-blur-sm rounded-3xl border border-green-800/50 overflow-hidden"
          >
            <div className="p-6 border-b border-green-800/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-800 rounded-xl flex items-center justify-center">
                  <Image className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Image Disease Detection</h3>
                  <p className="text-xs text-green-400">Snap. Upload. Diagnose.</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="relative bg-green-900/50 rounded-2xl overflow-hidden border border-green-800/50">
                {/* Leaf visual */}
                <div className="h-40 bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center relative">
                  <svg viewBox="0 0 120 80" className="w-32 h-24">
                    <path d="M60 5 C20 5 5 35 5 55 C5 70 25 75 60 75 C95 75 115 70 115 55 C115 35 100 5 60 5Z" fill="#22c55e" />
                    <path d="M60 5 L60 75" stroke="#16a34a" strokeWidth="1" fill="none" />
                    <path d="M60 20 L30 35" stroke="#16a34a" strokeWidth="0.5" fill="none" />
                    <path d="M60 35 L90 45" stroke="#16a34a" strokeWidth="0.5" fill="none" />
                    <path d="M60 50 L35 58" stroke="#16a34a" strokeWidth="0.5" fill="none" />
                    {/* Disease spots */}
                    <circle cx="40" cy="40" r="5" fill="#92400e" opacity="0.7" />
                    <circle cx="75" cy="30" r="3" fill="#92400e" opacity="0.5" />
                    <circle cx="55" cy="55" r="4" fill="#92400e" opacity="0.6" />
                  </svg>

                  {/* Scanning line */}
                  <motion.div
                    className="absolute left-0 right-0 h-0.5 bg-green-400 shadow-lg shadow-green-400/50"
                    style={{ top: `${scanProgress}%` }}
                  />
                </div>

                {/* Detection result */}
                <div className="p-3 border-t border-green-800/50">
                  <div className="flex items-center gap-2">
                    <Scan className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-medium text-white">Bacterial Leaf Blight</span>
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full ml-auto">94% match</span>
                  </div>
                  <p className="text-[10px] text-green-400 mt-1">Apply Streptocycline 0.5g/L + Copper Oxychloride</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Autonomous Actions */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-green-950/60 backdrop-blur-sm rounded-3xl border border-green-800/50 overflow-hidden"
          >
            <div className="p-6 border-b border-green-800/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-800 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Autonomous Actions</h3>
                  <p className="text-xs text-green-400">AI acts while you rest</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {[
                  { step: 1, label: 'Detect low moisture', status: 'done', icon: '📊' },
                  { step: 2, label: 'Check weather forecast', status: 'done', icon: '🌤️' },
                  { step: 3, label: 'Calculate water needed', status: 'done', icon: '🧮' },
                  { step: 4, label: 'Schedule irrigation', status: 'active', icon: '💧' },
                  { step: 5, label: 'Notify farmer', status: 'pending', icon: '📱' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.5 + i * 0.15 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                      item.status === 'done' ? 'bg-green-600' :
                      item.status === 'active' ? 'bg-green-600 animate-pulse' :
                      'bg-green-900 border border-green-700'
                    }`}>
                      {item.status === 'done' ? (
                        <span className="text-white text-xs">✓</span>
                      ) : (
                        <span>{item.icon}</span>
                      )}
                    </div>
                    <span className={`text-xs ${
                      item.status === 'pending' ? 'text-green-600' : 'text-white'
                    }`}>{item.label}</span>
                    {item.status === 'active' && (
                      <motion.div
                        className="ml-auto w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-green-800/30 rounded-xl border border-green-700/50">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-green-300 font-medium">Auto-irrigation triggered for Plot PL-ODL</span>
                </div>
                <p className="text-[10px] text-green-500 mt-1">Tomorrow 6:00 AM • 45 minutes • 2000L estimated</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
