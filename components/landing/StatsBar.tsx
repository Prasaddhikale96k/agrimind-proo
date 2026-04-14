'use client'

import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'

const stats = [
  { icon: '🌾', value: 12000, suffix: '+', label: 'Active Farms' },
  { icon: '📊', value: 4.9, suffix: '★', label: 'User Rating', decimals: 1 },
  { icon: '💰', value: 40, suffix: '%', label: 'Cost Reduction' },
  { icon: '🤖', value: 98, suffix: '%', label: 'AI Accuracy' },
]

export default function StatsBar() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 })

  return (
    <section
      ref={ref}
      className="relative py-16 bg-green-600 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #16a34a 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradient-shift 8s ease infinite',
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.8 }}
              className="text-center"
            >
              <span className="text-3xl mb-2 block">{stat.icon}</span>
              <p className="text-3xl md:text-4xl font-black text-white mb-1">
                {inView && (
                  <CountUp end={stat.value} duration={2} suffix={stat.suffix} decimals={stat.decimals || 0} separator="," />
                )}
              </p>
              <p className="text-green-200 text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
