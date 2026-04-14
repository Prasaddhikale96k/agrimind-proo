'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

export default function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  color = 'primary',
  status,
  delay = 0,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  unit?: string
  color?: 'primary' | 'secondary' | 'accent' | 'warning' | 'info'
  status?: string
  delay?: number
}) {
  const colorMap = {
    primary: 'from-primary to-primary-600',
    secondary: 'from-secondary to-emerald-500',
    accent: 'from-accent to-amber-500',
    warning: 'from-warning to-red-500',
    info: 'from-info to-blue-500',
  }

  const iconColorMap = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
    warning: 'bg-warning/10 text-warning',
    info: 'bg-info/10 text-info',
  }

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${iconColorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {status && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            status === 'Good' ? 'badge-green' :
            status === 'Warning' ? 'badge-yellow' :
            status === 'Critical' ? 'badge-red' : 'badge-gray'
          }`}>
            {status}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-dark">
          {value}
          {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
        </p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>
    </motion.div>
  )
}

