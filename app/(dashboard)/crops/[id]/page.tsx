'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { ArrowLeft, Leaf, Droplets, Calendar, TrendingUp, Sparkles, Beaker, Sun } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Crop, Farm, SoilData, IrrigationSchedule, SpraySchedule, FertilizationSchedule, FinancialRecord } from '@/types'
import { formatCurrency, daysUntil, formatDate, getHealthColor, getStatusBadge, getGrowthStageProgress } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

export default function CropDetailPage() {
  const params = useParams()
  const cropId = params.id as string
  const [crop, setCrop] = useState<Crop | null>(null)
  const [farm, setFarm] = useState<Farm | null>(null)
  const [soilData, setSoilData] = useState<SoilData[]>([])
  const [irrigations, setIrrigations] = useState<IrrigationSchedule[]>([])
  const [sprays, setSprays] = useState<SpraySchedule[]>([])
  const [fertilizations, setFertilizations] = useState<FertilizationSchedule[]>([])
  const [financials, setFinancials] = useState<FinancialRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [healthHistory] = useState([
    { date: 'Week 1', health: 90 },
    { date: 'Week 2', health: 88 },
    { date: 'Week 3', health: 92 },
    { date: 'Week 4', health: 85 },
    { date: 'Week 5', health: 91 },
    { date: 'Week 6', health: 94 },
  ])

  useEffect(() => {
    if (cropId) loadData()
  }, [cropId])

  async function loadData() {
    try {
      const [cropRes, farmRes, soilRes, irrRes, sprayRes, fertRes, finRes] = await Promise.all([
        supabase.from('crops').select('*').eq('id', cropId).single(),
        supabase.from('farms').select('*').eq('id', cropId).single(),
        supabase.from('soil_data').select('*').order('recorded_at', { ascending: false }).limit(14),
        supabase.from('irrigation_schedules').select('*').eq('crop_id', cropId).order('scheduled_date', { ascending: false }).limit(10),
        supabase.from('spray_schedules').select('*').eq('crop_id', cropId).order('scheduled_date', { ascending: false }).limit(10),
        supabase.from('fertilization_schedules').select('*').eq('crop_id', cropId).order('scheduled_date', { ascending: false }).limit(10),
        supabase.from('financial_records').select('*').eq('crop_id', cropId).order('record_date', { ascending: false }).limit(20),
      ])

      if (cropRes.data) setCrop(cropRes.data)
      if (farmRes.data) setFarm(farmRes.data)
      if (soilRes.data) setSoilData(soilRes.data)
      if (irrRes.data) setIrrigations(irrRes.data)
      if (sprayRes.data) setSprays(sprayRes.data)
      if (fertRes.data) setFertilizations(fertRes.data)
      if (finRes.data) setFinancials(finRes.data)
    } catch (error) {
      console.error('Error loading crop detail:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !crop) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading crop details...</div>
      </div>
    )
  }

  const progress = getGrowthStageProgress(crop.growth_stage || '')
  const projectedIncome = crop.expected_yield_kg && crop.market_price_per_kg
    ? crop.expected_yield_kg * crop.market_price_per_kg
    : 0
  const daysToHarvest = crop.expected_harvest_date ? daysUntil(crop.expected_harvest_date) : null
  const totalExpenses = financials.filter((f) => f.record_type === 'expenditure').reduce((sum, f) => sum + Number(f.amount), 0)
  const totalIncome = financials.filter((f) => f.record_type === 'income').reduce((sum, f) => sum + Number(f.amount), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/crops">
          <motion.button className="p-2 hover:bg-gray-100 rounded-xl transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </motion.button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {crop.crop_type === 'vegetable' ? '🍅' : crop.crop_type === 'grain' ? '🌾' : crop.crop_type === 'fruit' ? '🍎' : '🌿'}
            </span>
            <div>
              <h2 className="text-2xl font-bold text-dark">{crop.name}</h2>
              <p className="text-sm text-gray-500">{crop.variety} • {crop.season}</p>
            </div>
            <span className={`badge ${getStatusBadge(crop.status)}`}>{crop.status}</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-2">
            <Leaf className={`w-5 h-5 ${getHealthColor(crop.health_index)}`} />
            <span className="text-sm text-gray-500">Health Index</span>
          </div>
          <p className={`text-3xl font-bold ${getHealthColor(crop.health_index)}`}>{crop.health_index}%</p>
        </motion.div>
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-info" />
            <span className="text-sm text-gray-500">Days to Harvest</span>
          </div>
          <p className="text-3xl font-bold text-dark">{daysToHarvest ?? '—'}</p>
        </motion.div>
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <span className="text-sm text-gray-500">Projected Income</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(projectedIncome)}</p>
        </motion.div>
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-5 h-5 text-primary" />
            <span className="text-sm text-gray-500">Water/Day</span>
          </div>
          <p className="text-3xl font-bold text-dark">{crop.water_requirement_liters_per_day || 0}L</p>
        </motion.div>
      </div>

      {/* Growth Progress */}
      <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="font-semibold text-dark mb-4">Growth Stage</h3>
        <div className="flex items-center gap-2">
          {['germination', 'vegetative', 'flowering', 'fruiting', 'harvest'].map((stage, i) => {
            const stageProgress = (i + 1) * 20
            const isComplete = progress >= stageProgress
            const isCurrent = crop.growth_stage?.toLowerCase() === stage
            return (
              <div key={stage} className="flex-1 flex items-center">
                <motion.div
                  className={`flex-1 h-2 rounded-full ${isComplete ? 'bg-primary' : 'bg-gray-200'}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isComplete ? 1 : isCurrent ? 0.5 : 0 }}
                  transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isComplete ? 'bg-primary text-white' : isCurrent ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i + 1}
                </div>
                {i < 4 && <div className={`flex-1 h-2 rounded-full ${progress > stageProgress ? 'bg-primary' : 'bg-gray-200'}`} />}
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-2">
          {['Germination', 'Vegetative', 'Flowering', 'Fruiting', 'Harvest'].map((stage) => (
            <span key={stage} className="text-xs text-gray-500">{stage}</span>
          ))}
        </div>
      </motion.div>

      {/* Health Chart */}
      <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h3 className="font-semibold text-dark mb-4">Health History</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={healthHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <Tooltip />
            <Line type="monotone" dataKey="health" stroke="#1a7a4a" strokeWidth={3} dot={{ fill: '#1a7a4a', r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Financial Breakdown */}
      <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h3 className="font-semibold text-dark mb-4">Financial Breakdown</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-green-50 rounded-xl">
            <p className="text-sm text-green-600">Total Income</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-xl">
            <p className="text-sm text-red-600">Total Expenses</p>
            <p className="text-xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-600">Net Profit</p>
            <p className={`text-xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(totalIncome - totalExpenses)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Linked Schedules */}
      <div className="grid grid-cols-2 gap-6">
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <h3 className="font-semibold text-dark mb-4">Irrigation Schedule</h3>
          <div className="space-y-2">
            {irrigations.slice(0, 5).map((irr) => (
              <div key={irr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium">{formatDate(irr.scheduled_date)}</p>
                  <p className="text-xs text-gray-500">{irr.method} • {irr.water_volume_liters}L</p>
                </div>
                <span className={`badge ${getStatusBadge(irr.status)}`}>{irr.status}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <h3 className="font-semibold text-dark mb-4">Spray & Fertilization</h3>
          <div className="space-y-2">
            {[...sprays.slice(0, 3), ...fertilizations.slice(0, 3)].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium">{'chemical_name' in item ? item.chemical_name : item.fertilizer_name}</p>
                  <p className="text-xs text-gray-500">{'spray_type' in item ? item.spray_type : item.fertilizer_type}</p>
                </div>
                <span className={`badge ${getStatusBadge(item.status)}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Recommendations */}
      <motion.div className="glass-card-dark p-6 text-white" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">AI Recommendations</h3>
        </div>
        <div className="space-y-3">
          <div className="p-4 bg-white/10 rounded-xl">
            <p className="text-sm text-white/90">Based on current growth stage ({crop.growth_stage}), consider applying phosphorus-rich fertilizer to support root development.</p>
            <button className="mt-2 text-xs text-accent hover:text-amber-400 font-medium">Apply recommendation →</button>
          </div>
          <div className="p-4 bg-white/10 rounded-xl">
            <p className="text-sm text-white/90">Soil moisture is at {soilData[0]?.moisture_percent || 42}%. Schedule drip irrigation for tomorrow morning at 6:00 AM for optimal absorption.</p>
            <button className="mt-2 text-xs text-accent hover:text-amber-400 font-medium">Create irrigation schedule →</button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
