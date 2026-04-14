'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, FileText, Download, Calendar, TrendingUp, Droplets, Leaf, DollarSign } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Crop, Farm, SoilData, WeatherData, FinancialRecord } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts'

const COLORS = ['#1a7a4a', '#2ecc71', '#f39c12', '#3498db', '#e74c3c', '#9b59b6']

const containerVariants = { animate: { transition: { staggerChildren: 0.1 } } }
const cardVariants = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('farm')
  const [crops, setCrops] = useState<Crop[]>([])
  const [farms, setFarms] = useState<Farm[]>([])
  const [soilData, setSoilData] = useState<SoilData[]>([])
  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [financials, setFinancials] = useState<FinancialRecord[]>([])
  const [dateRange, setDateRange] = useState('30')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [cropsRes, farmsRes, soilRes, weatherRes, finRes] = await Promise.all([
        supabase.from('crops').select('*'),
        supabase.from('farms').select('*'),
        supabase.from('soil_data').select('*').order('recorded_at', { ascending: false }).limit(30),
        supabase.from('weather_data').select('*').order('recorded_at', { ascending: false }).limit(30),
        supabase.from('financial_records').select('*').order('record_date', { ascending: false }).limit(100),
      ])
      if (cropsRes.data) setCrops(cropsRes.data)
      if (farmsRes.data) setFarms(farmsRes.data)
      if (soilRes.data) setSoilData(soilRes.data)
      if (weatherRes.data) setWeatherData(weatherRes.data)
      if (finRes.data) setFinancials(finRes.data)
    } catch (error) { console.error(error) }
  }

  const tabs = [
    { key: 'farm', label: 'Farm Performance', icon: BarChart3 },
    { key: 'crop', label: 'Crop Yield', icon: Leaf },
    { key: 'financial', label: 'Financial P&L', icon: DollarSign },
    { key: 'water', label: 'Water Usage', icon: Droplets },
    { key: 'soil', label: 'Soil Health', icon: FileText },
  ]

  // Crop yield comparison data
  const cropYieldData = crops.map((c) => ({
    name: c.name,
    expected: c.expected_yield_kg || 0,
    actual: c.actual_yield_kg || c.expected_yield_kg! * 0.85,
    health: c.health_index,
  }))

  // Soil trend data
  const soilTrendData = soilData.slice(0, 14).reverse().map((s) => ({
    date: formatDate(s.recorded_at),
    moisture: Number(s.moisture_percent) || 0,
    ph: Number(s.ph_level) || 0,
    nitrogen: Number(s.nitrogen_ppm) || 0,
  }))

  // Income trend
  const incomeData = financials.reduce((acc, r) => {
    const date = formatDate(r.record_date)
    if (!acc[date]) acc[date] = { date, income: 0, expenditure: 0 }
    if (r.record_type === 'income') acc[date].income += Number(r.amount)
    else acc[date].expenditure += Number(r.amount)
    return acc
  }, {} as Record<string, { date: string; income: number; expenditure: number }>)
  const incomeChartData = Object.values(incomeData).slice(-10)

  // Expense breakdown
  const expenseBreakdown = financials.filter((r) => r.record_type === 'expenditure').reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + Number(r.amount)
    return acc
  }, {} as Record<string, number>)
  const pieData = Object.entries(expenseBreakdown).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))

  // Weather data
  const weatherChartData = weatherData.slice(0, 14).reverse().map((w) => ({
    date: formatDate(w.recorded_at),
    temp: Number(w.temperature_celsius) || 0,
    humidity: Number(w.humidity_percent) || 0,
    rainfall: Number(w.rainfall_mm) || 0,
  }))

  const totalIncome = financials.filter((r) => r.record_type === 'income').reduce((s, r) => s + Number(r.amount), 0)
  const totalExpense = financials.filter((r) => r.record_type === 'expenditure').reduce((s, r) => s + Number(r.amount), 0)
  const avgHealth = crops.length > 0 ? Math.round(crops.reduce((s, c) => s + c.health_index, 0) / crops.length) : 0
  const totalWater = soilData.reduce((s, d) => s + (Number(d.moisture_percent) || 0), 0)

  return (
    <motion.div variants={containerVariants} initial="initial" animate="animate" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark">Reports & Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Comprehensive farm performance insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="select-field w-auto"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="season">This Season</option>
          </select>
          <motion.button className="btn-secondary flex items-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div className="glass-card p-5" variants={cardVariants}>
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-green-500" /><span className="text-sm text-gray-500">Total Income</span></div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </motion.div>
        <motion.div className="glass-card p-5" variants={cardVariants}>
          <div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 text-red-500" /><span className="text-sm text-gray-500">Total Expense</span></div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
        </motion.div>
        <motion.div className="glass-card p-5" variants={cardVariants}>
          <div className="flex items-center gap-2 mb-2"><Leaf className="w-5 h-5 text-primary" /><span className="text-sm text-gray-500">Avg Crop Health</span></div>
          <p className="text-2xl font-bold text-primary">{avgHealth}%</p>
        </motion.div>
        <motion.div className="glass-card p-5" variants={cardVariants}>
          <div className="flex items-center gap-2 mb-2"><Droplets className="w-5 h-5 text-info" /><span className="text-sm text-gray-500">Active Farms</span></div>
          <p className="text-2xl font-bold text-dark">{farms.length}</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Farm Performance */}
      {activeTab === 'farm' && (
        <div className="grid grid-cols-2 gap-6">
          <motion.div className="glass-card p-6" variants={cardVariants}>
            <h3 className="font-semibold text-dark mb-4">Income vs Expenditure Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={incomeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#1a7a4a" strokeWidth={2} name="Income" />
                <Line type="monotone" dataKey="expenditure" stroke="#e74c3c" strokeWidth={2} name="Expenditure" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
          <motion.div className="glass-card p-6" variants={cardVariants}>
            <h3 className="font-semibold text-dark mb-4">Expense Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
              </RePieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {/* Crop Yield */}
      {activeTab === 'crop' && (
        <div className="grid grid-cols-2 gap-6">
          <motion.div className="glass-card p-6" variants={cardVariants}>
            <h3 className="font-semibold text-dark mb-4">Expected vs Actual Yield</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cropYieldData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="expected" fill="#1a7a4a" radius={[4, 4, 0, 0]} name="Expected (kg)" />
                <Bar dataKey="actual" fill="#2ecc71" radius={[4, 4, 0, 0]} name="Actual (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
          <motion.div className="glass-card p-6" variants={cardVariants}>
            <h3 className="font-semibold text-dark mb-4">Crop Health Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cropYieldData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip />
                <Bar dataKey="health" fill="#f39c12" radius={[4, 4, 0, 0]} name="Health Index" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {/* Financial */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <motion.div className="glass-card p-6" variants={cardVariants}>
            <h3 className="font-semibold text-dark mb-4">Monthly Financial Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={incomeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
                <Area type="monotone" dataKey="income" stroke="#1a7a4a" fill="#1a7a4a" fillOpacity={0.1} name="Income" />
                <Area type="monotone" dataKey="expenditure" stroke="#e74c3c" fill="#e74c3c" fillOpacity={0.1} name="Expenditure" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
          <motion.div className="glass-card p-6" variants={cardVariants}>
            <h3 className="font-semibold text-dark mb-4">Per-Plot P&L</h3>
            <div className="grid grid-cols-2 gap-4">
              {farms.map((farm) => {
                const farmFin = financials.filter((r) => r.farm_id === farm.id)
                const fIncome = farmFin.filter((r) => r.record_type === 'income').reduce((s, r) => s + Number(r.amount), 0)
                const fExpense = farmFin.filter((r) => r.record_type === 'expenditure').reduce((s, r) => s + Number(r.amount), 0)
                return (
                  <div key={farm.id} className="p-4 border border-gray-100 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{farm.name}</h4>
                      <span className="text-xs text-gray-500">{farm.plot_id}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Income</span><span className="font-medium text-green-600">{formatCurrency(fIncome)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Expense</span><span className="font-medium text-red-600">{formatCurrency(fExpense)}</span></div>
                      <div className="flex justify-between pt-2 border-t"><span className="font-medium">Net</span><span className={`font-bold ${fIncome - fExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(fIncome - fExpense)}</span></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Water Usage */}
      {activeTab === 'water' && (
        <motion.div className="glass-card p-6" variants={cardVariants}>
          <h3 className="font-semibold text-dark mb-4">Soil Moisture Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={soilTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip />
              <Area type="monotone" dataKey="moisture" stroke="#3498db" fill="#3498db" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Soil Health */}
      {activeTab === 'soil' && (
        <div className="grid grid-cols-2 gap-6">
          <motion.div className="glass-card p-6" variants={cardVariants}>
            <h3 className="font-semibold text-dark mb-4">NPK Levels Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={soilTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="nitrogen" stroke="#3498db" strokeWidth={2} name="Nitrogen" />
                <Line type="monotone" dataKey="ph" stroke="#2ecc71" strokeWidth={2} name="pH" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
          <motion.div className="glass-card p-6" variants={cardVariants}>
            <h3 className="font-semibold text-dark mb-4">Soil Summary</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Average Moisture</p>
                <p className="text-xl font-bold text-dark">{soilData.length > 0 ? (soilData.reduce((s, d) => s + (Number(d.moisture_percent) || 0), 0) / soilData.length).toFixed(1) : 0}%</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Average pH</p>
                <p className="text-xl font-bold text-dark">{soilData.length > 0 ? (soilData.reduce((s, d) => s + (Number(d.ph_level) || 0), 0) / soilData.length).toFixed(2) : 0}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Average Nitrogen</p>
                <p className="text-xl font-bold text-dark">{soilData.length > 0 ? (soilData.reduce((s, d) => s + (Number(d.nitrogen_ppm) || 0), 0) / soilData.length).toFixed(1) : 0} ppm</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Total Readings</p>
                <p className="text-xl font-bold text-dark">{soilData.length}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

