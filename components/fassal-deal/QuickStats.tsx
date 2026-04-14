'use client'

import { motion } from 'framer-motion'
import { Store, TrendingUp, Sprout, ShoppingCart } from 'lucide-react'

export default function QuickStats() {
  const stats = [
    { label: 'Markets Tracked', value: '2,400+', icon: Store, color: 'green' },
    { label: 'Avg Profit Increase', value: '23%', icon: TrendingUp, color: 'blue' },
    { label: 'Crops Covered', value: '50+', icon: Sprout, color: 'emerald' },
    { label: 'Deals Today', value: '847', icon: ShoppingCart, color: 'purple' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
        >
          <div className={`p-2 rounded-lg bg-${stat.color}-50`}>
            <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
