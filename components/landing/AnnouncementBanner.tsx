'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
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
          className="bg-green-100 border-b border-green-200 overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3 relative">
            <p className="text-sm text-green-700 font-medium">
              🎉 New: AI Image Disease Detection is now live!{' '}
              <span className="underline cursor-pointer hover:text-green-800">Try it free →</span>
            </p>
            <motion.button
              onClick={() => setVisible(false)}
              className="absolute right-4 p-1 hover:bg-green-200 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4 text-green-700" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
