'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  LayoutDashboard,
  Sprout,
  DollarSign,
  Bot,
  Bell,
  TrendingUp,
  Droplets,
  Sun,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'crops', label: 'Crops', icon: Sprout },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'ai', label: 'AI Assistant', icon: Bot },
  { id: 'alerts', label: 'Alerts', icon: Bell },
]

const tabContent: Record<string, React.ReactNode> = {
  dashboard: (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Plant Health', value: '94%', color: 'text-green-600', icon: '🌱' },
          { label: 'Soil pH', value: '7.6', color: 'text-blue-600', icon: '🧪' },
          { label: 'Humidity', value: '82%', color: 'text-cyan-600', icon: '💧' },
          { label: 'Temperature', value: '32°C', color: 'text-orange-600', icon: '☀️' },
        ].map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl p-3 border border-green-100"
          >
            <span className="text-lg">{m.icon}</span>
            <p className={`text-lg font-bold ${m.color} mt-1`}>{m.value}</p>
            <p className="text-[10px] text-gray-500">{m.label}</p>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 bg-white rounded-xl p-4 border border-green-100">
          <p className="text-xs font-semibold text-gray-700 mb-3">Farm Overview</p>
          <div className="flex gap-2">
            {[
              { id: 'PL-ODL', health: 94 },
              { id: 'CL-ODL', health: 87 },
              { id: 'PL-B', health: 72 },
            ].map((plot, i) => (
              <div key={i} className="flex-1 bg-green-50 rounded-lg p-3 text-center">
                <p className="text-[10px] font-bold text-green-700">{plot.id}</p>
                <p className="text-xs text-green-600 font-semibold mt-1">{plot.health}%</p>
                <div className="w-full bg-green-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-green-500 h-1.5 rounded-full"
                    style={{ width: `${plot.health}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-green-100">
          <p className="text-xs font-semibold text-gray-700 mb-2">Weather</p>
          <p className="text-2xl mb-1">☀️</p>
          <p className="text-lg font-bold text-gray-900">32°C</p>
          <p className="text-[10px] text-gray-500">Sunny • Humid</p>
        </div>
      </div>
    </div>
  ),
  crops: (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-700">Active Crops</h4>
        <span className="text-xs text-green-600 font-medium">3 plots active</span>
      </div>
      {[
        { name: 'Paddy (Kharif)', plot: 'PL-ODL', stage: 'Tillering', health: 94, area: '2.5 acres' },
        { name: 'Cotton', plot: 'CL-ODL', stage: 'Flowering', health: 87, area: '3.0 acres' },
        { name: 'Pulses', plot: 'PL-B', stage: 'Podding', health: 72, area: '1.5 acres' },
      ].map((crop, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white rounded-xl p-4 border border-green-100 flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900">{crop.name}</p>
            <p className="text-[10px] text-gray-500">{crop.plot} • {crop.area}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-gray-700">{crop.stage}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-16 bg-green-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${crop.health > 85 ? 'bg-green-500' : crop.health > 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${crop.health}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-gray-600">{crop.health}%</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  ),
  finance: (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-xl p-3 border border-green-200">
          <p className="text-[10px] text-gray-500">Income</p>
          <p className="text-lg font-bold text-green-700">₹2,45,000</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3 text-green-600" />
            <span className="text-[10px] text-green-600 font-medium">+18%</span>
          </div>
        </div>
        <div className="bg-red-50 rounded-xl p-3 border border-red-200">
          <p className="text-[10px] text-gray-500">Expenditure</p>
          <p className="text-lg font-bold text-red-700">₹1,12,000</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowDownRight className="w-3 h-3 text-red-600" />
            <span className="text-[10px] text-red-600 font-medium">-5%</span>
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
          <p className="text-[10px] text-gray-500">Net Profit</p>
          <p className="text-lg font-bold text-blue-700">₹1,33,000</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-blue-600" />
            <span className="text-[10px] text-blue-600 font-medium">+32%</span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-green-100">
        <p className="text-xs font-semibold text-gray-700 mb-3">Monthly Breakdown</p>
        <div className="space-y-2">
          {[
            { label: 'Seeds', amount: 25000, pct: 22 },
            { label: 'Fertilizer', amount: 35000, pct: 31 },
            { label: 'Labor', amount: 30000, pct: 27 },
            { label: 'Irrigation', amount: 22000, pct: 20 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[10px] text-gray-500 w-16">{item.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <motion.div
                  className="bg-green-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
              </div>
              <span className="text-[10px] font-bold text-gray-700">₹{item.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  ai: (
    <div className="p-6 space-y-4">
      <div className="bg-green-900 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-green-300" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">AgriMind AI</p>
            <p className="text-[10px] text-green-400">Online • Ready</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="bg-green-800 rounded-lg p-2 rounded-tl-none max-w-[85%]">
            <p className="text-[11px] text-green-200">What should I spray for pest control on my cotton plot?</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 rounded-tr-none max-w-[90%] ml-auto">
            <p className="text-[11px] text-white">
              Based on your plot CL-ODL data, I recommend Imidacloprid 17.8% SL at 0.3ml/L. Apply in the evening when wind speed is below 10 km/h. Next suitable window: Tomorrow 5-7 PM.
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 bg-white border border-green-200 rounded-lg px-3 py-2 text-[10px] text-gray-400">
          Ask AI anything...
        </div>
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
          <ArrowUpRight className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
    </div>
  ),
  alerts: (
    <div className="p-6 space-y-3">
      {[
        { type: 'warning', icon: AlertTriangle, title: 'Low Soil Moisture', desc: 'Plot PL-ODL moisture dropped to 35%', time: '2h ago', color: 'amber' },
        { type: 'success', icon: CheckCircle, title: 'Fertilizer Applied', desc: 'NPK schedule completed for CL-ODL', time: '5h ago', color: 'green' },
        { type: 'info', icon: Droplets, title: 'Rain Expected', desc: '60% chance of rain in next 48 hours', time: '8h ago', color: 'blue' },
        { type: 'warning', icon: Sun, title: 'Heat Advisory', desc: 'Temperature may exceed 38°C tomorrow', time: '1d ago', color: 'orange' },
      ].map((alert, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white rounded-xl p-3 border border-green-100 flex items-start gap-3"
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            alert.color === 'amber' ? 'bg-amber-100' :
            alert.color === 'green' ? 'bg-green-100' :
            alert.color === 'blue' ? 'bg-blue-100' : 'bg-orange-100'
          }`}>
            <alert.icon className={`w-4 h-4 ${
              alert.color === 'amber' ? 'text-amber-600' :
              alert.color === 'green' ? 'text-green-600' :
              alert.color === 'blue' ? 'text-blue-600' : 'text-orange-600'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900">{alert.title}</p>
            <p className="text-[10px] text-gray-500 truncate">{alert.desc}</p>
          </div>
          <span className="text-[10px] text-gray-400 flex-shrink-0">{alert.time}</span>
        </motion.div>
      ))}
    </div>
  ),
}

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 })

  return (
    <section id="dashboard-preview" ref={ref} className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-green-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-green-200/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            See It In Action
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore every corner of the AgriMind Pro dashboard
          </p>
          <motion.div
            className="w-20 h-1 bg-green-500 mx-auto mt-6 rounded-full"
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                  : 'bg-green-50 text-gray-600 hover:bg-green-100 hover:text-green-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Browser Frame */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto bg-white rounded-2xl border border-green-200 shadow-2xl shadow-green-600/10 overflow-hidden"
        >
          {/* Browser Chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white rounded-lg px-3 py-1.5 text-[10px] text-gray-400 text-center border border-gray-100">
                agrimindpro.com/{activeTab}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-green-50/30 min-h-[320px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {tabContent[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
