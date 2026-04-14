'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Loader2 } from 'lucide-react'

const SCAN_STEPS = [
  'Checking mandi prices across India...',
  'Finding private buyers near you...',
  'Calculating transport costs...',
  'Analyzing price trends...',
  'Checking buyer ratings and reviews...',
  'Calculating net profit for each option...',
  'Asking AI to rank the best deals...',
  'Generating your personalized report...',
]

const FUN_FACTS = [
  'Selling directly to buyers can save 5-8% in mandi commission!',
  'Transport costs average Rs 8-25 per quintal per 10km.',
  'Grade A crops fetch 10-15% premium at export houses.',
  'Nashik grapes command premium prices in Mumbai markets.',
  'Timing your sale during off-season can increase profits by 20%.',
]

export default function Step4Scanning({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [factIndex, setFactIndex] = useState(0)
  const [marketsScanned, setMarketsScanned] = useState(0)

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= SCAN_STEPS.length - 1) return prev
        const next = prev + 1
        setProgress((next / SCAN_STEPS.length) * 100)
        setMarketsScanned((m) => Math.min(2400, m + Math.floor(Math.random() * 400 + 100)))
        return next
      })
    }, 600)

    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FUN_FACTS.length)
    }, 3000)

    return () => {
      clearInterval(stepInterval)
      clearInterval(factInterval)
    }
  }, [])

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Finding Best Deals For You...</h2>
        <p className="text-gray-500 mt-2">Analyzing mandi prices, transport costs, and buyer options</p>
      </div>

      {/* AI Orb */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <motion.div
            className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span className="text-white text-2xl font-bold">AI</span>
          </motion.div>
          <motion.div
            className="absolute inset-0 border-4 border-green-400 rounded-full"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <motion.div
            className="absolute inset-0 border-2 border-green-300 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            style={{ transformOrigin: 'center' }}
          />
        </div>
      </div>

      {/* Scanning Steps */}
      <div className="space-y-3 mb-8 max-w-lg mx-auto">
        {SCAN_STEPS.map((step, i) => (
          <motion.div
            key={step}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: i <= currentStep ? 1 : 0.3 }}
            className="flex items-center gap-3"
          >
            {i < currentStep ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : i === currentStep ? (
              <Loader2 className="w-5 h-5 text-green-600 animate-spin flex-shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
            )}
            <span className={`text-sm ${i <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}>
              {step}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
        <motion.div
          className="bg-green-600 h-3 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="text-center text-sm text-gray-500 mb-6">{Math.round(progress)}% complete</p>

      {/* Live Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-xl">
          <p className="text-2xl font-bold text-green-600">{marketsScanned.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-500">Markets Scanned</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-xl">
          <p className="text-2xl font-bold text-blue-600">{Math.floor(marketsScanned / 30)}</p>
          <p className="text-xs text-gray-500">Buyers Found</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-xl">
          <p className="text-2xl font-bold text-yellow-600">Rs{Math.floor(1200 + Math.random() * 300)}</p>
          <p className="text-xs text-gray-500">Best Price/q</p>
        </div>
      </div>

      {/* Fun Facts */}
      <AnimatePresence mode="wait">
        <motion.div
          key={factIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 bg-gray-50 rounded-xl text-center"
        >
          <p className="text-sm text-gray-600">💡 {FUN_FACTS[factIndex]}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
