'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Leaf } from 'lucide-react'

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 200)
          return 100
        }
        return prev + 4
      })
    }, 40)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <AnimatePresence>
      {progress < 105 && (
        <motion.div
          className="fixed inset-0 z-[100] bg-green-600 flex flex-col items-center justify-center"
          exit={{ y: '-100%', transition: { duration: 0.6, ease: 'easeInOut' } }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-8"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center"
            >
              <Leaf className="w-10 h-10 text-white" />
            </motion.div>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-1">AgriMind Pro</h1>
              <p className="text-green-200 text-sm">AI-Powered Farm Management</p>
            </div>

            <div className="w-64 h-1.5 bg-green-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-green-200 text-xs">{progress}%</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
