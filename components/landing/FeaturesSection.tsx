'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useRef } from 'react'
import {
  Bot, Droplets, Sprout, DollarSign, SprayCan, Flower2,
  BarChart3, Bell, CloudSun, ArrowRight,
} from 'lucide-react'

const features = [
  {
    icon: Bot,
    title: 'Agentic AI Assistant',
    desc: 'Chat with your personal farm AI. Ask anything — get instant data-driven recommendations with full context of your farm.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Droplets,
    title: 'Smart Irrigation',
    desc: 'AI-powered irrigation scheduling based on real-time soil moisture, weather forecasts, and crop water requirements.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Sprout,
    title: 'Crop Health Monitor',
    desc: 'Track growth stages, health index, and get AI alerts before diseases spread. Upload images for instant diagnosis.',
    color: 'from-green-500 to-lime-500',
  },
  {
    icon: DollarSign,
    title: 'Financial Intelligence',
    desc: 'Complete P&L tracking per plot. Know your income, expenditure, ROI, and profit per acre — all automatically calculated.',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    icon: SprayCan,
    title: 'Spray Scheduler',
    desc: 'Weather-aware spray scheduling. AI checks wind speed, humidity before recommending spray windows.',
    color: 'from-purple-500 to-violet-500',
  },
  {
    icon: Flower2,
    title: 'Fertilization Planner',
    desc: 'Growth-stage-linked fertilization. Know exactly what NPK ratio your crop needs at every stage.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    desc: 'Beautiful charts for soil trends, weather patterns, water usage, and crop performance — all in one dashboard.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Bell,
    title: 'Smart Alert System',
    desc: 'Database-trigger powered alerts. Get notified the moment soil moisture drops or temperature spikes.',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: CloudSun,
    title: 'Weather Intelligence',
    desc: 'Farm-specific weather analysis with AI recommendations. Know the best days for each farm operation.',
    color: 'from-sky-500 to-teal-500',
  },
]

export default function FeaturesSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const gridRef = useRef<HTMLDivElement>(null)

  return (
    <section id="features" ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Everything Your Farm Needs
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            One platform. Infinite possibilities.
          </p>
          <motion.div
            className="w-20 h-1 bg-green-500 mx-auto mt-6 rounded-full"
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>

        {/* Grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 80, scale: 0.9 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.7,
                delay: i * 0.08,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              whileHover={{
                y: -8,
                scale: 1.02,
                boxShadow: '0 25px 50px rgba(22,163,74,0.15)',
                borderColor: '#4ade80',
              }}
              className="group bg-white border border-green-100 rounded-3xl p-8 hover:border-green-400 transition-all duration-300 relative overflow-hidden cursor-pointer"
            >
              {/* Corner bg */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Icon */}
              <motion.div
                className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 relative"
                whileHover={{ rotate: 10, scale: 1.1 }}
              >
                <feature.icon className="w-7 h-7 text-green-600" />
              </motion.div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-6">{feature.desc}</p>

              {/* Learn more */}
              <div className="flex items-center gap-2 text-green-600 font-medium text-sm group-hover:gap-3 transition-all">
                Learn more <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
