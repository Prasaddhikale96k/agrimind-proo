'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Check, X } from 'lucide-react'

const features = [
  { feature: 'AI Crop Recommendations', traditional: false, agrimind: true },
  { feature: 'Real-time Soil Monitoring', traditional: false, agrimind: true },
  { feature: 'Disease Detection via Photos', traditional: false, agrimind: true },
  { feature: 'Financial Tracking & P&L', traditional: false, agrimind: true },
  { feature: 'Weather-based Alerts', traditional: false, agrimind: true },
  { feature: 'Smart Irrigation Scheduling', traditional: false, agrimind: true },
  { feature: 'Natural Language AI Chat', traditional: false, agrimind: true },
  { feature: 'Plot-wise Analytics', traditional: false, agrimind: true },
  { feature: 'Multi-farm Management', traditional: false, agrimind: true },
  { feature: 'Export Reports (PDF/Excel)', traditional: false, agrimind: true },
]

export default function ComparisonTable() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="comparison" ref={ref} className="py-24 bg-green-50 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Why AgriMind Pro?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how we compare to traditional farming methods
          </p>
          <motion.div
            className="w-20 h-1 bg-green-500 mx-auto mt-6 rounded-full"
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl border border-green-200 shadow-xl shadow-green-600/5 overflow-hidden"
        >
          {/* Header */}
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
            <div className="p-5 text-sm font-bold text-gray-700">Features</div>
            <div className="p-5 text-sm font-bold text-gray-500 text-center">Traditional Methods</div>
            <div className="p-5 text-sm font-bold text-green-700 text-center bg-green-50">AgriMind Pro</div>
          </div>

          {/* Rows */}
          {features.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="grid grid-cols-3 border-b border-gray-50 last:border-b-0 hover:bg-green-50/30 transition-colors"
            >
              <div className="p-4 text-sm font-medium text-gray-700 flex items-center">
                {row.feature}
              </div>
              <div className="p-4 flex items-center justify-center">
                <X className="w-5 h-5 text-red-400" />
              </div>
              <div className="p-4 flex items-center justify-center bg-green-50/50">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ delay: 0.5 + i * 0.05, type: 'spring', stiffness: 300 }}
                >
                  <Check className="w-5 h-5 text-green-600" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
