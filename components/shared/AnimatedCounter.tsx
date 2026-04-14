'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.5,
}: {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
}) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => {
    return prefix + latest.toFixed(decimals) + suffix
  })
  const [display, setDisplay] = useState('')

  useEffect(() => {
    const animation = animate(count, value, { duration })
    const unsubscribe = rounded.on('change', setDisplay)
    return () => {
      animation.stop()
      unsubscribe()
    }
  }, [value, duration])

  return <motion.span>{display}</motion.span>
}

