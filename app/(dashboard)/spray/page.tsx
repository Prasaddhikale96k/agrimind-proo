'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SprayCan, Plus, Calendar, DollarSign, Wind, Sparkles, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { SpraySchedule, Crop, Farm, WeatherData } from '@/types'
import { formatCurrency, formatDate, getStatusBadge } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

const containerVariants = { animate: { transition: { staggerChildren: 0.1 } } }
const cardVariants = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

const sprayColors: Record<string, string> = {
  pesticide: 'bg-red-100 text-red-700 border-red-200',
  herbicide: 'bg-blue-100 text-blue-700 border-blue-200',
  fungicide: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  foliar: 'bg-green-100 text-green-700 border-green-200',
}

export default function SprayPage() {
  const [schedules, setSchedules] = useState<SpraySchedule[]>([])
  const [crops, setCrops] = useState<Crop[]>([])
  const [farms, setFarms] = useState<Farm[]>([])
  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    crop_id: '', spray_type: 'pesticide', chemical_name: '', dosage_ml_per_liter: '',
    water_volume_liters: '', scheduled_date: '', scheduled_time: '06:00',
    cost_per_liter_chemical: '', total_labor_cost: '', notes: '',
  })

  useEffect(() => { loadData() }, [])
  useEffect(() => { if (farms.length > 0 && !selectedFarm) setSelectedFarm(farms[0].id) }, [farms])

  async function loadData() {
    try {
      const [sprayRes, cropsRes, farmsRes, weatherRes] = await Promise.all([
        supabase.from('spray_schedules').select('*').order('scheduled_date', { ascending: false }).limit(50),
        supabase.from('crops').select('*'),
        supabase.from('farms').select('*'),
        supabase.from('weather_data').select('*').order('recorded_at', { ascending: false }).limit(1),
      ])
      if (sprayRes.data) setSchedules(sprayRes.data)
      if (cropsRes.data) setCrops(cropsRes.data)
      if (farmsRes.data) setFarms(farmsRes.data)
      if (weatherRes.data) setWeatherData(weatherRes.data)
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const farmSprays = schedules.filter((s) => s.farm_id === selectedFarm)
  const totalCost = farmSprays.reduce((sum, s) => sum + (Number(s.total_cost) || 0), 0)
  const upcoming = farmSprays.filter((s) => s.status === 'pending').length
  const weatherOk = weatherData[0]?.wind_speed_mps && weatherData[0].wind_speed_mps < 5

  const sprayTypeData = farmSprays.reduce((acc, s) => {
    const type = s.spray_type || 'unknown'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(sprayTypeData).map(([type, count]) => ({ type, count }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const crop = crops.find((c) => c.id === formData.crop_id)
      const chemicalCost = (parseFloat(formData.dosage_ml_per_liter) || 0) * (parseFloat(formData.water_volume_liters) || 0) * (parseFloat(formData.cost_per_liter_chemical) || 0) / 1000
      const laborCost = parseFloat(formData.total_labor_cost) || 0
      const { error } = await supabase.from('spray_schedules').insert({
        farm_id: crop?.farm_id || '',
        crop_id: formData.crop_id,
        spray_type: formData.spray_type,
        chemical_name: formData.chemical_name,
        dosage_ml_per_liter: parseFloat(formData.dosage_ml_per_liter),
        water_volume_liters: parseFloat(formData.water_volume_liters),
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time,
        cost_per_liter_chemical: parseFloat(formData.cost_per_liter_chemical),
        total_labor_cost: laborCost,
        total_cost: chemicalCost + laborCost,
        weather_suitable: weatherOk,
        notes: formData.notes,
      })
      if (error) throw error
      toast.success('Spray schedule added!')
      setShowForm(false)
      loadData()
    } catch (error: unknown) { toast.error(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`) }
  }

  return (
    <motion.div variants={containerVariants} initial="initial" animate="animate" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark">Spray Schedule</h2>
          <p className="text-sm text-gray-500 mt-1">Manage pesticide, herbicide, and fungicide applications</p>
        </div>
        <motion.button className="btn-primary flex items-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Add Spray
        </motion.button>
      </div>

      <div className="flex gap-2">
        {farms.map((farm) => (
          <button key={farm.id} onClick={() => setSelectedFarm(farm.id)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedFarm === farm.id ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {farm.name}
          </button>
        ))}
      </div>

      {/* Weather Warning */}
      {!weatherOk && (
        <motion.div className="glass-card p-4 border-l-4 border-warning" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <div>
              <p className="text-sm font-medium text-warning">Wind Speed Alert</p>
              <p className="text-xs text-gray-600">Current wind speed ({weatherData[0]?.wind_speed_mps} m/s) is too high for spraying. Wait for calmer conditions.</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <motion.div className="glass-card p-5" variants={cardVariants}>
          <div className="flex items-center gap-2 mb-2"><SprayCan className="w-5 h-5 text-red-500" /><span className="text-sm text-gray-500">Upcoming</span></div>
          <p className="text-2xl font-bold text-dark">{upcoming}</p>
        </motion.div>
        <motion.div className="glass-card p-5" variants={cardVariants}>
          <div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 text-accent" /><span className="text-sm text-gray-500">Total Cost</span></div>
          <p className="text-2xl font-bold text-dark">{formatCurrency(totalCost)}</p>
        </motion.div>
        <motion.div className="glass-card p-5" variants={cardVariants}>
          <div className="flex items-center gap-2 mb-2"><Wind className="w-5 h-5 text-info" /><span className="text-sm text-gray-500">Wind Speed</span></div>
          <p className="text-2xl font-bold text-dark">{weatherData[0]?.wind_speed_mps || 3.2} <span className="text-sm font-normal text-gray-500">m/s</span></p>
        </motion.div>
        <motion.div className="glass-card p-5" variants={cardVariants}>
          <div className="flex items-center gap-2 mb-2"><Calendar className="w-5 h-5 text-primary" /><span className="text-sm text-gray-500">Completed</span></div>
          <p className="text-2xl font-bold text-dark">{farmSprays.filter((s) => s.status === 'completed').length}</p>
        </motion.div>
      </div>

      {/* Spray Chart */}
      <motion.div className="glass-card p-6" variants={cardVariants}>
        <h3 className="font-semibold text-dark mb-4">Sprays by Type</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="type" tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <Tooltip />
            <Bar dataKey="count" fill="#1a7a4a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Spray Schedule Table */}
      <motion.div className="glass-card p-6" variants={cardVariants}>
        <h3 className="font-semibold text-dark mb-4">All Spray Schedules</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Chemical</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Dosage</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Cost</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Weather</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {farmSprays.slice(0, 15).map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4"><span className={`badge border ${sprayColors[s.spray_type || ''] || 'badge-gray'}`}>{s.spray_type}</span></td>
                  <td className="py-3 px-4 font-medium">{s.chemical_name || '—'}</td>
                  <td className="py-3 px-4">{formatDate(s.scheduled_date)}</td>
                  <td className="py-3 px-4">{s.dosage_ml_per_liter} ml/L</td>
                  <td className="py-3 px-4">{formatCurrency(Number(s.total_cost) || 0)}</td>
                  <td className="py-3 px-4">{s.weather_suitable ? '✅ Suitable' : '⚠️ Not ideal'}</td>
                  <td className="py-3 px-4"><span className={`badge ${getStatusBadge(s.status)}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* AI Recommendations */}
      <motion.div className="glass-card-dark p-6 text-white" variants={cardVariants}>
        <div className="flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-accent" /><h3 className="font-semibold">AI Spray Recommendations</h3></div>
        <div className="space-y-3">
          <div className="p-4 bg-white/10 rounded-xl">
            <p className="text-sm text-white/90">Based on current crop stage and humidity levels, apply fungicide to prevent fungal infections. Optimal window: 6AM-9AM tomorrow (wind &lt; 3m/s).</p>
            <p className="text-xs text-accent mt-2 font-medium">Confidence: 89%</p>
          </div>
          <div className="p-4 bg-white/10 rounded-xl">
            <p className="text-sm text-white/90">Consider applying neem oil as a natural pesticide. It's effective against common pests and safe for beneficial insects.</p>
            <button className="mt-2 text-xs text-accent hover:text-amber-400 font-medium">Create spray schedule →</button>
          </div>
        </div>
      </motion.div>

      {showForm && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div className="bg-white rounded-2xl w-full max-w-lg m-4 p-6 max-h-[90vh] overflow-y-auto" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <h2 className="text-xl font-bold text-dark mb-6">Add Spray Schedule</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
                  <select className="select-field" value={formData.crop_id} onChange={(e) => setFormData({ ...formData, crop_id: e.target.value })}>
                    {crops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spray Type</label>
                  <select className="select-field" value={formData.spray_type} onChange={(e) => setFormData({ ...formData, spray_type: e.target.value })}>
                    <option value="pesticide">Pesticide</option>
                    <option value="herbicide">Herbicide</option>
                    <option value="fungicide">Fungicide</option>
                    <option value="foliar">Foliar</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chemical Name</label>
                <input className="input-field" value={formData.chemical_name} onChange={(e) => setFormData({ ...formData, chemical_name: e.target.value })} placeholder="e.g., Neem Oil" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dosage (ml/L)</label>
                  <input type="number" step="0.001" className="input-field" value={formData.dosage_ml_per_liter} onChange={(e) => setFormData({ ...formData, dosage_ml_per_liter: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Water Volume (L)</label>
                  <input type="number" className="input-field" value={formData.water_volume_liters} onChange={(e) => setFormData({ ...formData, water_volume_liters: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" required className="input-field" value={formData.scheduled_date} onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" className="input-field" value={formData.scheduled_time} onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chemical Cost (₹/L)</label>
                  <input type="number" step="0.01" className="input-field" value={formData.cost_per_liter_chemical} onChange={(e) => setFormData({ ...formData, cost_per_liter_chemical: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Labor Cost (₹)</label>
                  <input type="number" step="0.01" className="input-field" value={formData.total_labor_cost} onChange={(e) => setFormData({ ...formData, total_labor_cost: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Add Spray</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

