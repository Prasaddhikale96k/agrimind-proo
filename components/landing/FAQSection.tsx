'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What is AgriMind Pro?',
    answer: 'AgriMind Pro is an AI-powered farm management platform that helps farmers track soil health, monitor crops, manage finances, and get intelligent recommendations — all in one place.',
  },
  {
    question: 'How does the AI assistant work?',
    answer: 'Our AI assistant understands farming context. You can ask questions in natural language about your crops, soil, weather, or finances, and it provides data-driven recommendations specific to your farm.',
  },
  {
    question: 'Do I need technical knowledge to use it?',
    answer: 'Not at all. AgriMind Pro is designed for farmers, not tech experts. The interface is simple and intuitive, and the AI chat lets you interact in plain language.',
  },
  {
    question: 'How accurate is the disease detection?',
    answer: 'Our AI disease detection model achieves 94%+ accuracy on common crop diseases. It analyzes uploaded images of your crops and identifies diseases, pests, and nutrient deficiencies.',
  },
  {
    question: 'Can I manage multiple farm plots?',
    answer: 'Yes! The Free plan supports 1 plot, Pro supports up to 10 plots, and Enterprise offers unlimited plots. Each plot has its own analytics, alerts, and recommendations.',
  },
  {
    question: 'Is my data safe and private?',
    answer: 'Absolutely. All data is encrypted and stored securely. We never share your farm data with third parties. You own your data and can export or delete it at any time.',
  },
  {
    question: 'What languages does the AI support?',
    answer: 'Currently, AgriMind Pro supports English and Hindi. We are actively working on adding Marathi, Tamil, Telugu, and other regional languages.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time with no penalties. Your access continues until the end of your billing period. You can also downgrade to the free plan.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="faq" ref={ref} className="py-24 bg-green-50 relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about AgriMind Pro
          </p>
          <motion.div
            className="w-20 h-1 bg-green-500 mx-auto mt-6 rounded-full"
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-white rounded-2xl border border-green-100 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-green-50/50 transition-colors"
              >
                <span className="text-base font-semibold text-gray-900 pr-4">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
