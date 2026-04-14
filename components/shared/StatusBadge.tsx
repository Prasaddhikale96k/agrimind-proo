'use client'

import { motion } from 'framer-motion'
import { cn, getSeverityColor, getStatusBadge } from '@/lib/utils'

export default function StatusBadge({
  status,
  variant = 'default',
  pulse = false,
}: {
  status: string
  variant?: 'default' | 'severity'
  pulse?: boolean
}) {
  const className = variant === 'severity' ? getSeverityColor(status) : getStatusBadge(status)

  return (
    <motion.span
      className={cn('badge', className, pulse && 'animate-pulse')}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </motion.span>
  )
}

