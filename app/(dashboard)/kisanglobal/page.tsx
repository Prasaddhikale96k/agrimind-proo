'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  RefreshCw,
  Calculator,
  Users,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageCircle,
  Send,
  X,
  ChevronDown,
  MapPin,
  Calendar,
  Package,
  DollarSign,
  Star,
  Loader2,
  Download,
  Eye,
} from 'lucide-react'
import { API_KEYS, FALLBACK_MANDI_PRICES, EXPORT_PRICES, AGENT_PRICES, KISANGLOBAL_PRICES } from '@/lib/kisanglobal-config'
import {
  fetchWeatherData,
  generateWeatherAdvisory,
  fetchMandiPricesFromAPI,
  fetchExchangeRate,
  submitBuyerInterest,
  generateExportDocument,
  initEmailJS,
  getCachedData,
  setCachedData,
} from '@/lib/kisanglobal-services'
import { useToast, ToastContainer } from '@/components/shared/Toast'
import emailjs from '@emailjs/browser'
import { jsPDF } from 'jspdf'

// Animation variants
const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

// Crop data with emojis
const CROPS = [
  { name: 'Grapes', emoji: '🍇' },
  { name: 'Onion', emoji: '🧅' },
  { name: 'Pomegranate', emoji: '🍎' },
  { name: 'Banana', emoji: '🍌' },
  { name: 'Tomato', emoji: '🍅' },
  { name: 'Mango', emoji: '🥭' },
  { name: 'Okra', emoji: '🌿' },
]

// Buyer data
const BUYERS = [
  { country: 'UAE', flag: '🇦🇪', crop: 'Red Onions', quantity: 80, price: 26, delivery: 'May–June 2026' },
  { country: 'Netherlands', flag: '🇳🇱', crop: 'Thompson Grapes', quantity: 45, price: 95, delivery: 'Aug–Sep 2026' },
  { country: 'Saudi Arabia', flag: '🇸🇦', crop: 'Bananas', quantity: 120, price: 36, delivery: 'Ongoing' },
  { country: 'UK', flag: '🇬🇧', crop: 'Alphonso Mango', quantity: 30, price: 85, delivery: 'Apr–May 2026' },
  { country: 'Malaysia', flag: '🇲🇾', crop: 'Okra', quantity: 25, price: 28, delivery: 'Ongoing' },
  { country: 'Germany', flag: '🇩🇪', crop: 'Pomegranate', quantity: 60, price: 115, delivery: 'Oct–Nov 2026' },
  { country: 'Qatar', flag: '🇶🇦', crop: 'Tomatoes', quantity: 40, price: 20, delivery: 'Ongoing' },
  { country: 'Canada', flag: '🇨🇦', crop: 'Frozen Mango Pulp', quantity: 35, price: 110, delivery: 'Jun–Aug 2026' },
]

// FPO Groups
const FPO_GROUPS = [
  { id: 1, name: 'Nashik Grape FPO', crop: 'Grapes', farmers: 23, current: 45, target: 100, location: 'Nashik' },
  { id: 2, name: 'Nashik Onion Collective', crop: 'Onion', farmers: 18, current: 30, target: 50, location: 'Nashik' },
  { id: 3, name: 'Pune Pomegranate FPO', crop: 'Pomegranate', farmers: 31, current: 78, target: 80, location: 'Pune', ready: true },
]

// Processing units
const PROCESSING_UNITS = [
  { name: 'Mahagrape Processing', location: 'Nashik', processes: 'Grapes/Raisins', rate: 2800 },
  { name: 'FreshFreeze India', location: 'Pune', processes: 'IQF Mango/Vegetables', rate: 3200 },
  { name: 'NashikAgro Pulp Co', location: 'Nashik', processes: 'Mango Pulp, Tomato Paste', rate: 2500 },
  { name: 'Maharashtra Cold IQF', location: 'Aurangabad', processes: 'All Vegetables', rate: 2900 },
]

// Testimonials
const TESTIMONIALS = [
  { name: 'Ramesh Patil', location: 'Nashik', text: 'Mera grape ₹45 ki jagah ₹96/kg mein bikha. Shukriya KisanGlobal!', rating: 5 },
  { name: 'Sunita Devi', location: 'Pune', text: 'Pehli baar Dubai export kiya. Agent ki zarurat hi nahi padi.', rating: 5 },
  { name: 'Vijay More', location: 'Sangli', text: 'FPO join kiya, pool karke 60MT export kiya. Life change ho gayi.', rating: 5 },
]

// Animated counter component
function AnimatedCounter({ target, duration = 2000, prefix = '', suffix = '' }: { target: number; duration?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true)
      let startTime: number
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)
        setCount(Math.floor(progress * target))
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)
    }
  }, [target, duration, hasStarted])

  return <span>{prefix}{count.toLocaleString('en-IN')}{suffix}</span>
}

export default function KisanGlobalPage() {
  const { toasts, addToast, removeToast } = useToast()

  // State management
  const [mandiPrices, setMandiPrices] = useState<Record<string, number>>(FALLBACK_MANDI_PRICES)
  const [isLive, setIsLive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [usdRate, setUsdRate] = useState(83.5)
  const [weatherAdvisory, setWeatherAdvisory] = useState<{ type: 'success' | 'warning' | 'danger'; message: string; aiAdvice?: string } | null>(null)

  // Calculator state
  const [calcCrop, setCalcCrop] = useState('Grapes')
  const [calcCost, setCalcCost] = useState(20)
  const [calcQuantity, setCalcQuantity] = useState(10)
  const [calcMethod, setCalcMethod] = useState<'agent' | 'kisanglobal'>('kisanglobal')
  const [calcResult, setCalcResult] = useState<any>(null)

  // Buyer connect modal
  const [showBuyerModal, setShowBuyerModal] = useState(false)
  const [selectedBuyer, setSelectedBuyer] = useState<any>(null)
  const [buyerForm, setBuyerForm] = useState({ name: '', phone: '', quantity: '', date: '' })

  // Export readiness
  const [readinessItems, setReadinessItems] = useState([
    { id: 1, name: 'Farm Registration (APEDA)', status: 'done' as const, description: 'Required for all agricultural exports' },
    { id: 2, name: 'GlobalGAP Certification', status: 'not-done' as const, description: 'International quality standard' },
    { id: 3, name: 'Quality Grading Report', status: 'in-progress' as const, description: 'Produce quality assessment' },
    { id: 4, name: 'Cold Chain Access', status: 'not-done' as const, description: 'Temperature-controlled storage' },
    { id: 5, name: 'FPO Membership', status: 'done' as const, description: 'Farmer Producer Organization' },
    { id: 6, name: 'Export Documentation', status: 'not-done' as const, description: 'Required paperwork for exports' },
  ])

  // FPO state
  const [joinedGroups, setJoinedGroups] = useState<number[]>([])
  const [showFpoModal, setShowFpoModal] = useState(false)

  // Document generator
  const [showDocModal, setShowDocModal] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [docForm, setDocForm] = useState({ name: '', crop: '', quantity: '', country: '', date: '' })

  // Chatbot
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'bot'; text: string; time: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const chatRef = useRef<HTMLDivElement>(null)

  // Fetch mandi prices, exchange rate, and weather on mount
  useEffect(() => {
    // Initialize EmailJS
    initEmailJS()

    fetchMandiPrices()
    fetchExchangeRateData()
    fetchWeatherAdvisory()
    loadLocalStorageData()
  }, [])

  async function fetchMandiPrices() {
    // Check cache first
    const cached = getCachedData('mandi_prices', 2 * 60 * 60 * 1000) // 2 hours

    if (cached) {
      setMandiPrices(cached.prices)
      setIsLive(cached.isLive)
      setLoading(false)
      addToast('Prices loaded from cache', 'info')
      return
    }

    setLoading(true)
    try {
      const result = await fetchMandiPricesFromAPI()

      setMandiPrices(result.prices)
      setIsLive(result.isLive)

      // Cache the result
      setCachedData('mandi_prices', result)

      if (result.isLive) {
        addToast('✅ Live mandi prices fetched from Agmarknet', 'success')
      } else {
        addToast('Using estimated prices (API unavailable)', 'warning')
      }
    } catch (error) {
      console.error('Failed to fetch mandi prices:', error)
      setMandiPrices(FALLBACK_MANDI_PRICES)
      addToast('Using fallback prices', 'warning')
    } finally {
      setLoading(false)
    }
  }

  async function fetchExchangeRateData() {
    try {
      const rate = await fetchExchangeRate()
      setUsdRate(rate)
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error)
      setUsdRate(83.5)
    }
  }

  async function fetchWeatherAdvisory() {
    try {
      const weatherData = await fetchWeatherData('Nashik,IN')

      if (weatherData) {
        const advisory = generateWeatherAdvisory(weatherData, 'Grapes')
        setWeatherAdvisory(advisory)
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error)
    }
  }

  function loadLocalStorageData() {
    const saved = localStorage.getItem('kisanglobal_readiness')
    if (saved) {
      setReadinessItems(JSON.parse(saved))
    }

    const savedChat = localStorage.getItem('kisanglobal_chat')
    if (saved) {
      setChatMessages(JSON.parse(saved).slice(-10))
    }

    const savedJoined = localStorage.getItem('kisanglobal_fpo_joined')
    if (saved) {
      setJoinedGroups(JSON.parse(saved))
    }
  }

  function calculateProfit() {
    const agentPrice = AGENT_PRICES[calcCrop as keyof typeof AGENT_PRICES] || 20
    const kgGlobalPrice = KISANGLOBAL_PRICES[calcCrop as keyof typeof KISANGLOBAL_PRICES] || 40
    const quantityKg = calcQuantity * 1000 // tons to kg

    const agentTotal = agentPrice * quantityKg
    const kgGlobalTotal = kgGlobalPrice * quantityKg
    const difference = kgGlobalTotal - agentTotal
    const percentage = ((difference / agentTotal) * 100).toFixed(0)

    setCalcResult({
      agentTotal,
      kgGlobalTotal,
      difference,
      percentage,
    })
  }

  function getReadinessScore() {
    const scores = { 'done': 17, 'in-progress': 8, 'not-done': 0 }
    const total = readinessItems.reduce((sum, item) => sum + scores[item.status], 0)
    return Math.min(total, 100)
  }

  function updateReadinessStatus(id: number, status: 'done' | 'in-progress' | 'not-done') {
    const updated = readinessItems.map(item =>
      item.id === id ? { ...item, status } : item
    )
    setReadinessItems(updated)
    localStorage.setItem('kisanglobal_readiness', JSON.stringify(updated))
  }

  function handleBuyerConnect(buyer: any) {
    setSelectedBuyer(buyer)
    setShowBuyerModal(true)
  }

  async function submitBuyerForm() {
    if (!buyerForm.name || !buyerForm.phone || !buyerForm.quantity || !buyerForm.date) {
      addToast('Please fill all required fields', 'error')
      return
    }

    const result = await submitBuyerInterest({
      name: buyerForm.name,
      phone: buyerForm.phone,
      quantity: buyerForm.quantity,
      date: buyerForm.date,
      crop: selectedBuyer.crop,
      country: selectedBuyer.country,
      price: selectedBuyer.price.toString(),
    })

    if (result.success) {
      addToast(result.message, 'success')
      setShowBuyerModal(false)
      setBuyerForm({ name: '', phone: '', quantity: '', date: '' })
    } else {
      addToast(result.message, 'error')
    }
  }

  function joinFpoGroup(id: number) {
    const updated = [...joinedGroups, id]
    setJoinedGroups(updated)
    localStorage.setItem('kisanglobal_fpo_joined', JSON.stringify(updated))
    alert('✅ Successfully joined the FPO group!')
  }

  function openDocModal(doc: any) {
    setSelectedDoc(doc)
    setShowDocModal(true)
  }

  async function generatePDF() {
    if (!docForm.name || !docForm.crop || !docForm.quantity || !docForm.country || !docForm.date) {
      addToast('Please fill all required fields', 'error')
      return
    }

    try {
      const result = await generateExportDocument(selectedDoc.name, docForm)

      if (result.success) {
        addToast(`✅ Document Generated — ${result.filename}`, 'success')
        setShowDocModal(false)
        setDocForm({ name: '', crop: '', quantity: '', country: '', date: '' })
      } else {
        addToast('Failed to generate document', 'error')
      }
    } catch (error) {
      console.error('PDF generation error:', error)
      addToast('Failed to generate PDF', 'error')
    }
  }

  async function sendChatMessage(message: string) {
    if (!message.trim()) return

    const newMsg = {
      role: 'user' as const,
      text: message,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }

    const updated = [...chatMessages, newMsg]
    setChatMessages(updated)
    setChatInput('')
    setIsTyping(true)

    try {
      // Using existing AgriMind AI chat endpoint with custom system prompt
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          history: updated.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text })),
        }),
      })

      const data = await res.json()
      const botResponse = data.response || 'Namaste! Main aapki export mein madad kar sakta hoon. Poochiye koi bhi sawaal!'

      setTimeout(() => {
        const botMsg = {
          role: 'bot' as const,
          text: botResponse,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        }
        const finalChat = [...updated, botMsg]
        setChatMessages(finalChat)
        setIsTyping(false)
        localStorage.setItem('kisanglobal_chat', JSON.stringify(finalChat))
      }, 1000)
    } catch (error) {
      console.error('Chat failed:', error)
      setIsTyping(false)
      // Fallback response
      const fallbackMsg = {
        role: 'bot' as const,
        text: 'Namaste! Main aapki export mein madad kar sakta hoon. Kripya phir se poochhein.',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }
      setChatMessages([...updated, fallbackMsg])
    }
  }

  return (
    <div className="relative">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* Sticky Top Bar */}
        <motion.div variants={cardVariants} className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-xl shadow-lg sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6" />
              <span className="font-bold text-lg">KisanGlobal Export Hub</span>
              <span className="text-sm opacity-90">|</span>
              <span className="text-sm">Nashik, Maharashtra</span>
              <span className="text-sm opacity-90">|</span>
              <span className="text-sm font-semibold">Export Season: Active ✅</span>
            </div>
          </div>
        </motion.div>

        {/* Season Alert */}
        <motion.div variants={cardVariants} className="bg-gradient-to-r from-orange-400 to-amber-500 text-white px-6 py-4 rounded-xl shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍇</span>
            <div>
              <h3 className="font-bold text-lg">Grape Export Season PEAK</h3>
              <p className="text-sm opacity-90">Buyers offering premium prices. Act now!</p>
            </div>
          </div>
        </motion.div>

        {/* Weather Advisory */}
        {weatherAdvisory && (
          <motion.div
            variants={cardVariants}
            className={`px-6 py-4 rounded-xl shadow-md ${weatherAdvisory.type === 'success'
              ? 'bg-green-50 border-l-4 border-green-500 text-green-800'
              : weatherAdvisory.type === 'warning'
                ? 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800'
                : 'bg-red-50 border-l-4 border-red-500 text-red-800'
              }`}
          >
            <p className="font-medium">{weatherAdvisory.message}</p>
          </motion.div>
        )}

        {/* Stats Counters */}
        <motion.div variants={cardVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: 2847, label: 'Farmers Connected', suffix: '' },
            { value: 18.4, label: '₹ Cr Saved from Middlemen', prefix: '₹', suffix: ' Cr', decimal: true },
            { value: 23, label: 'Countries Exporting To', suffix: '' },
            { value: 89, label: 'Success Rate', suffix: '%' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-emerald-600">
                <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* SECTION 1: Export Price Comparison */}
        <motion.div variants={cardVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">Live Export Prices</h2>
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLive ? 'bg-green-400' : 'bg-gray-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isLive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              </span>
            </div>
            <button
              onClick={fetchMandiPrices}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Prices
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Crop</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Local Mandi Price (₹/kg)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Export Market Price (₹/kg)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Your Earning (₹/kg)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Profit Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {CROPS.map((crop) => {
                  const mandiPrice = mandiPrices?.[crop.name] || FALLBACK_MANDI_PRICES[crop.name as keyof typeof FALLBACK_MANDI_PRICES]
                  const exportPrice = EXPORT_PRICES[crop.name as keyof typeof EXPORT_PRICES] || 0
                  const earning = Math.round(exportPrice * 0.68)
                  const diff = earning - mandiPrice

                  return (
                    <tr key={crop.name} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900">
                        <span className="text-xl mr-2">{crop.emoji}</span>
                        {crop.name}
                      </td>
                      <td className="px-4 py-4 text-gray-600">₹{mandiPrice}/kg</td>
                      <td className="px-4 py-4 text-gray-600">₹{exportPrice}/kg</td>
                      <td className="px-4 py-4 font-semibold text-emerald-600">₹{earning}/kg</td>
                      <td className="px-4 py-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          +₹{diff} more per kg
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* SECTION 2 & 3: Profit Calculator + Buyer Connect */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Profit Calculator */}
          <motion.div variants={cardVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How Much More Can You Earn?</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Crop</label>
                <select
                  value={calcCrop}
                  onChange={(e) => setCalcCrop(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {CROPS.map(crop => (
                    <option key={crop.name} value={crop.name}>{crop.emoji} {crop.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Production Cost (₹/kg)</label>
                <input
                  type="number"
                  value={calcCost}
                  onChange={(e) => setCalcCost(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Available (tons)</label>
                <input
                  type="number"
                  value={calcQuantity}
                  onChange={(e) => setCalcQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={calculateProfit}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Calculate Earnings
              </button>

              {calcResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 rounded-xl p-4 space-y-3"
                >
                  <p className="text-gray-700">If you sell via Agent: <span className="font-semibold">₹{calcResult.agentTotal.toLocaleString()}</span></p>
                  <p className="text-gray-700">If you export via KisanGlobal: <span className="font-semibold">₹{calcResult.kgGlobalTotal.toLocaleString()}</span></p>
                  <p className="text-2xl font-bold text-emerald-600">
                    You earn ₹{calcResult.difference.toLocaleString()} MORE with KisanGlobal
                  </p>
                  <p className="text-lg font-semibold text-green-700">
                    That is {calcResult.percentage}% more income for your family
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Global Buyer Connect */}
          <motion.div variants={cardVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Live Buyer Requirements</h2>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {BUYERS.map((buyer, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{buyer.flag} {buyer.country}</h3>
                      <p className="text-sm text-gray-600">{buyer.crop}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      ₹{buyer.price}/kg
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {buyer.quantity} MT
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {buyer.delivery}
                    </span>
                  </div>
                  <button
                    onClick={() => handleBuyerConnect(buyer)}
                    className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    Connect Now
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* SECTION 4: Export Readiness Score */}
        <motion.div variants={cardVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Export Readiness Score</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Circular Progress */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" stroke="#e5e7eb" strokeWidth="10" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#10b981"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${(getReadinessScore() / 100) * 283} 283`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-emerald-600">{getReadinessScore()}</span>
                  <span className="text-sm text-gray-600">/ 100</span>
                </div>
              </div>
              <p className="text-center mt-4 text-sm text-gray-600">
                {getReadinessScore() < 50 ? 'Needs Improvement' : getReadinessScore() < 80 ? 'Good Progress' : 'Excellent!'}
              </p>
            </div>

            {/* Checklist */}
            <div className="md:col-span-2 space-y-3">
              {readinessItems.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0">
                    {item.status === 'done' && <CheckCircle className="w-6 h-6 text-green-500" />}
                    {item.status === 'not-done' && <XCircle className="w-6 h-6 text-red-500" />}
                    {item.status === 'in-progress' && <AlertTriangle className="w-6 h-6 text-yellow-500" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <div className="flex gap-2 mt-2">
                      {item.status !== 'done' && (
                        <button
                          onClick={() => updateReadinessStatus(item.id, 'done')}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        >
                          Mark Complete
                        </button>
                      )}
                      {item.status === 'not-done' && (
                        <button
                          onClick={() => updateReadinessStatus(item.id, 'in-progress')}
                          className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                        >
                          Start
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Complete all steps to unlock Premium Buyer Access and export to 15+ countries
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
              <div
                className="bg-gradient-to-r from-emerald-500 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getReadinessScore()}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* SECTION 5 & 6: FPO Aggregation + Value Addition */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* FPO Aggregation */}
          <motion.div variants={cardVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pool Your Produce with Other Farmers</h2>
            <p className="text-sm text-gray-600 mb-6">
              Pooling lets you meet 50MT minimum export order. Alone you cannot export. Together you can!
            </p>

            <div className="space-y-4">
              {FPO_GROUPS.map((group) => (
                <div key={group.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-600">{group.crop} • {group.location}</p>
                    </div>
                    {group.ready && <CheckCircle className="w-6 h-6 text-green-500" />}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Users className="w-4 h-4" />
                    <span>{group.farmers} farmers</span>
                    <span className="mx-2">•</span>
                    <span>{group.current}MT / {group.target}MT</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full transition-all ${group.ready ? 'bg-green-500' : 'bg-emerald-500'
                        }`}
                      style={{ width: `${(group.current / group.target) * 100}%` }}
                    />
                  </div>
                  {!joinedGroups.includes(group.id) && !group.ready && (
                    <button
                      onClick={() => joinFpoGroup(group.id)}
                      className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                      Join This Group
                    </button>
                  )}
                  {joinedGroups.includes(group.id) && (
                    <p className="text-center text-sm text-green-600 font-medium">✅ Joined</p>
                  )}
                  {group.ready && (
                    <p className="text-center text-sm text-green-600 font-medium">✅ Shipment Ready</p>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowFpoModal(true)}
              className="w-full mt-4 py-3 border-2 border-dashed border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
            >
              + Start New Pool
            </button>
          </motion.div>

          {/* Value Addition Marketplace */}
          <motion.div variants={cardVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Earn More by Processing Your Produce</h2>

            <div className="space-y-4 mb-6">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                <p className="text-sm font-medium text-gray-900">Fresh Mango: ₹35/kg → Mango Pulp (IQF): ₹88/kg</p>
                <p className="text-lg font-bold text-emerald-600 mt-1">+₹53/kg (151% more)</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <p className="text-sm font-medium text-gray-900">Fresh Grapes: ₹45/kg → Raisins: ₹180/kg</p>
                <p className="text-lg font-bold text-emerald-600 mt-1">+₹135/kg (300% more)</p>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 border border-red-200">
                <p className="text-sm font-medium text-gray-900">Fresh Tomato: ₹10/kg → Tomato Paste: ₹55/kg</p>
                <p className="text-lg font-bold text-emerald-600 mt-1">+₹45/kg (450% more)</p>
              </div>
            </div>

            <h3 className="font-bold text-gray-900 mb-4">Nearby Processing Units</h3>
            <div className="space-y-3">
              {PROCESSING_UNITS.map((unit, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{unit.name}</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {unit.location}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Processes: {unit.processes}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-600">₹{unit.rate}/MT</p>
                      <button className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm">
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* SECTION 7: Export Document Generator */}
        <motion.div variants={cardVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">One-Click Export Document Generator</h2>
          <p className="text-sm text-gray-600 mb-6">Generate professional export documents in seconds — no agent needed</p>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { name: 'Phytosanitary Certificate', icon: '📄', desc: 'Plant health certification' },
              { name: 'Certificate of Origin', icon: '📋', desc: 'Product origin proof' },
              { name: 'Invoice & Packing List', icon: '📦', desc: 'Commercial documentation' },
              { name: 'Shipping Bill Draft', icon: '🚢', desc: 'Customs documentation' },
            ].map((doc, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all hover:shadow-md">
                <div className="text-4xl mb-4">{doc.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{doc.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{doc.desc}</p>
                <button
                  onClick={() => openDocModal(doc)}
                  className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Generate
                </button>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-6 text-center">
            These documents are templates. Final certification must be done via APEDA registered agency.
          </p>
        </motion.div>

        {/* Testimonials */}
        <motion.div variants={cardVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Share Your Success</h2>
          <p className="text-center text-gray-600 mb-6">Farmers using KisanGlobal are earning 2.3x more on average</p>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, i) => (
              <div key={i} className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100">
                <div className="flex items-center gap-1 mb-3">
                  {Array(testimonial.rating).fill(null).map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Buyer Connect Modal */}
        <AnimatePresence>
          {showBuyerModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowBuyerModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Express Interest to {selectedBuyer?.flag} {selectedBuyer?.country} Buyer
                  </h3>
                  <button onClick={() => setShowBuyerModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Farmer/FPO Name</label>
                    <input
                      type="text"
                      value={buyerForm.name}
                      onChange={(e) => setBuyerForm({ ...buyerForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={buyerForm.phone}
                      onChange={(e) => setBuyerForm({ ...buyerForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Quantity (tons)</label>
                    <input
                      type="number"
                      value={buyerForm.quantity}
                      onChange={(e) => setBuyerForm({ ...buyerForm, quantity: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery Date</label>
                    <input
                      type="date"
                      value={buyerForm.date}
                      onChange={(e) => setBuyerForm({ ...buyerForm, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    onClick={submitBuyerForm}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg"
                  >
                    Submit Interest
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Document Generator Modal */}
        <AnimatePresence>
          {showDocModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowDocModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Generate {selectedDoc?.name}</h3>
                  <button onClick={() => setShowDocModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Farmer/FPO Name</label>
                    <input
                      type="text"
                      value={docForm.name}
                      onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Crop</label>
                    <input
                      type="text"
                      value={docForm.crop}
                      onChange={(e) => setDocForm({ ...docForm, crop: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (MT)</label>
                    <input
                      type="number"
                      value={docForm.quantity}
                      onChange={(e) => setDocForm({ ...docForm, quantity: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Buyer Country</label>
                    <input
                      type="text"
                      value={docForm.country}
                      onChange={(e) => setDocForm({ ...docForm, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shipment Date</label>
                    <input
                      type="date"
                      value={docForm.date}
                      onChange={(e) => setDocForm({ ...docForm, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    onClick={generatePDF}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Generate & Download PDF
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Chatbot */}
        <div className="fixed bottom-6 right-6 z-50">
          <AnimatePresence>
            {showChat && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 w-[350px] h-[500px] flex flex-col"
              >
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌱</span>
                    <div>
                      <h3 className="font-bold">KisanBot</h3>
                      <p className="text-xs opacity-90">Export Advisor</p>
                    </div>
                  </div>
                  <button onClick={() => setShowChat(false)} className="p-1 hover:bg-white/20 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Chat Messages */}
                <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-600 mb-4">Quick Questions:</p>
                      <div className="space-y-2">
                        {[
                          'Mera onion export kaise karu?',
                          'Export ke liye kya documents chahiye?',
                          'FPO join karna chahiye ya nahi?',
                        ].map((q, i) => (
                          <button
                            key={i}
                            onClick={() => sendChatMessage(q)}
                            className="block w-full text-left px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm text-gray-700"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-xl p-3 ${msg.role === 'user'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                        }`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.role === 'user' ? 'opacity-70' : 'text-gray-500'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-xl p-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-3 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage(chatInput)}
                      placeholder="Type your question..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                    <button
                      onClick={() => sendChatMessage(chatInput)}
                      className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Toggle Button */}
          <button
            onClick={() => setShowChat(!showChat)}
            className="w-14 h-14 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center hover:scale-105 transition-all"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}