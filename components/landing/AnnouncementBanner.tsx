'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { useState } from 'react'

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-emerald-50 border-b border-emerald-100 overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-center gap-3 relative">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <p className="text-sm text-emerald-700 font-medium">
                <span className="hidden sm:inline">New: AI Image Disease Detection is now live! </span>
                <span className="sm:hidden">New: AI Disease Detection live! </span>
                <span className="underline cursor-pointer hover:text-emerald-800 font-semibold">Try it free →</span>
              </p>
            </div>
            <motion.button
              onClick={() => setVisible(false)}
              className="absolute right-4 sm:right-6 p-1.5 hover:bg-emerald-100 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4 text-emerald-600" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
