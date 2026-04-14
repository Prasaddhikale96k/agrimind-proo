'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Check, TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, PieChart, Receipt } from 'lucide-react'

const features = [
  'Track income & expenditure per plot',
  'Automatic ROI calculation',
  'Cost-per-acre breakdown',
  'Profit margin analytics',
  'Season-wise financial reports',
  'Export to Excel/PDF',
]

export default function FinancialSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 })

  return (
    <section id="financial" ref={ref} className="py-24 bg-green-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-green-200/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Know Every Rupee. Grow Every Acre.
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete financial intelligence for your farming operation
          </p>
          <motion.div
            className="w-20 h-1 bg-green-500 mx-auto mt-6 rounded-full"
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Features */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-6">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Financial Intelligence</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Your Farm&apos;s Financial Command Center
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Stop guessing where your money goes. AgriMind Pro tracks every rupee spent and earned,
              giving you crystal-clear visibility into your farm&apos;s profitability.
            </p>
            <div className="space-y-4">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Animated P&L Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-white rounded-3xl border border-green-200 shadow-xl shadow-green-600/10 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Receipt className="w-5 h-5 text-green-200" />
                    <span className="text-sm font-medium text-green-200">Profit & Loss — Kharif 2025</span>
                  </div>
                  <PieChart className="w-5 h-5 text-green-200" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-green-200 mb-1">Total Income</p>
                    <p className="text-xl font-bold text-white">₹2,45,000</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-200 mb-1">Expenditure</p>
                    <p className="text-xl font-bold text-green-200">₹1,12,000</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-200 mb-1">Net Profit</p>
                    <p className="text-xl font-bold text-yellow-300">₹1,33,000</p>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="p-6 space-y-4">
                {/* Income */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Income Sources</span>
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  </div>
                  {[
                    { label: 'Paddy Sales', amount: 165000, pct: 67 },
                    { label: 'Cotton Sales', amount: 55000, pct: 22 },
                    { label: 'Pulses Sales', amount: 25000, pct: 11 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 mb-2">
                      <span className="text-[11px] text-gray-500 w-24">{item.label}</span>
                      <div className="flex-1 bg-green-100 rounded-full h-2.5">
                        <motion.div
                          className="bg-green-500 h-2.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={inView ? { width: `${item.pct}%` } : {}}
                          transition={{ duration: 1, delay: 0.5 + i * 0.15 }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-gray-700">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Expenditure */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Expenditure</span>
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  </div>
                  {[
                    { label: 'Seeds', amount: 25000, pct: 22 },
                    { label: 'Fertilizers', amount: 35000, pct: 31 },
                    { label: 'Labor', amount: 30000, pct: 27 },
                    { label: 'Irrigation', amount: 22000, pct: 20 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 mb-2">
                      <span className="text-[11px] text-gray-500 w-24">{item.label}</span>
                      <div className="flex-1 bg-red-100 rounded-full h-2.5">
                        <motion.div
                          className="bg-red-400 h-2.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={inView ? { width: `${item.pct}%` } : {}}
                          transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-gray-700">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* ROI */}
                <div className="pt-4 border-t border-gray-100 bg-green-50 rounded-xl p-4 -mx-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-bold text-gray-900">Return on Investment</span>
                    </div>
                    <span className="text-2xl font-black text-green-600">118.7%</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">For every ₹1 spent, you earned ₹2.19</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
