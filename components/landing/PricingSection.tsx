'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Check, ArrowRight, Star, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

const plans = [
  {
    name: 'Free Starter',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for trying out smart farming',
    features: [
      '1 farm plot',
      'Basic soil tracking',
      'Weather forecasts',
      'AI chat (5 queries/day)',
      'Basic alerts',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Pro Farmer',
    price: { monthly: 499, yearly: 399 },
    description: 'Everything you need to grow smarter',
    features: [
      'Up to 10 farm plots',
      'Full soil & crop analytics',
      'AI disease detection',
      'Unlimited AI chat',
      'Financial tracking & P&L',
      'Smart irrigation scheduling',
      'Spray & fertilizer planner',
      'Export reports',
      'Priority support',
    ],
    cta: 'Get Pro Access',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: { monthly: null, yearly: null },
    description: 'For large-scale farming operations',
    features: [
      'Unlimited farm plots',
      'Multi-user access',
      'Custom AI models',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'On-premise deployment option',
      'Training & onboarding',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const { signInWithGoogle } = useAuth()

  return (
    <section id="pricing" ref={ref} className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-40 left-20 w-64 h-64 bg-green-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-20 w-72 h-72 bg-green-200/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free. Upgrade when you are ready.
          </p>
          <motion.div
            className="w-20 h-1 bg-green-500 mx-auto mt-6 rounded-full"
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          />

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isYearly ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <motion.div
                className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow"
                animate={{ x: isYearly ? 28 : 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
            </span>
            {isYearly && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full"
              >
                Save 20%
              </motion.span>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.15 }}
              className={`relative rounded-3xl p-8 ${
                plan.highlighted
                  ? 'bg-green-600 text-white shadow-2xl shadow-green-600/30 scale-105 z-10'
                  : 'bg-white border border-green-200 text-gray-900'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.highlighted ? 'text-green-200' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                {plan.price.monthly !== null ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm opacity-70">₹</span>
                    <span className="text-5xl font-black">
                      {isYearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    <span className={`text-sm ${plan.highlighted ? 'text-green-200' : 'text-gray-500'}`}>
                      /{isYearly ? 'mo' : 'mo'}
                    </span>
                  </div>
                ) : (
                  <span className="text-4xl font-black">Custom</span>
                )}
                {isYearly && plan.price.monthly !== null && (
                  <p className={`text-xs mt-1 ${plan.highlighted ? 'text-green-200' : 'text-gray-500'}`}>
                    Billed ₹{((plan.price.yearly as number) * 12).toLocaleString()}/year
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fi) => (
                  <li key={fi} className="flex items-center gap-3 text-sm">
                    <Check className={`w-4 h-4 flex-shrink-0 ${
                      plan.highlighted ? 'text-green-200' : 'text-green-600'
                    }`} />
                    <span className={plan.highlighted ? 'text-green-100' : 'text-gray-600'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <motion.button
                onClick={signInWithGoogle}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  plan.highlighted
                    ? 'bg-white text-green-700 hover:bg-green-50'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
