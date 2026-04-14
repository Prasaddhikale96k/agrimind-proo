'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  Leaf,
  Droplets,
  Calendar,
  TrendingUp,
  Eye,
  Edit,
  Sparkles,
  X,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Crop, Farm } from '@/types'
import { formatCurrency, daysUntil, getHealthColor, getStatusBadge, growthStages, getGrowthStageProgress } from '@/lib/utils'
import toast from 'react-hot-toast'

const containerVariants = {
  animate: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function CropsPage() {
  const [crops, setCrops] = useState<Crop[]>([])
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [cropsRes, farmsRes] = await Promise.all([
        supabase.from('crops').select('*').order('created_at', { ascending: false }),
        supabase.from('farms').select('*'),
      ])
      if (cropsRes.data) setCrops(cropsRes.data)
      if (farmsRes.data) setFarms(farmsRes.data)
    } catch (error) {
      console.error('Error loading crops:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCrops = crops.filter((crop) => {
    const matchesFilter = filter === 'all' || crop.status === filter
    const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (crop.variety?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    return matchesFilter && matchesSearch
  })

  const filters = [
    { key: 'all', label: 'All', count: crops.length },
    { key: 'growing', label: 'Growing', count: crops.filter((c) => c.status === 'growing').length },
    { key: 'harvested', label: 'Harvested', count: crops.filter((c) => c.status === 'harvested').length },
    { key: 'mature', label: 'Mature', count: crops.filter((c) => c.status === 'mature').length },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark">
            <span className="text-primary">{crops.length}</span> Total Crops
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage and monitor all your crops</p>
        </div>
        <motion.button
          className="btn-primary flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
        >
          <Plus className="w-4 h-4" />
          Add Crop
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f.key
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {f.label}
              <span className={`ml-2 text-xs ${filter === f.key ? 'text-white/80' : 'text-gray-400'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-xs ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search crops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Crop Cards Grid */}
      <motion.div
        className="grid grid-cols-3 gap-5"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {filteredCrops.map((crop) => {
          const farm = farms.find((f) => f.id === crop.farm_id)
          const daysToHarvest = crop.expected_harvest_date ? daysUntil(crop.expected_harvest_date) : null
          const projectedIncome = crop.expected_yield_kg && crop.market_price_per_kg
            ? crop.expected_yield_kg * crop.market_price_per_kg
            : 0
          const progress = getGrowthStageProgress(crop.growth_stage || '')

          return (
            <motion.div
              key={crop.id}
              className="glass-card overflow-hidden"
              variants={cardVariants}
              whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}
            >
              {/* Card Header */}
              <div className="h-32 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center relative">
                <span className="text-5xl">
                  {crop.crop_type === 'vegetable' ? '🍅' :
                   crop.crop_type === 'grain' ? '🌾' :
                   crop.crop_type === 'fruit' ? '🍎' : '🌿'}
                </span>
                <div className="absolute top-3 right-3">
                  <span className={`badge ${getStatusBadge(crop.status)}`}>
                    {crop.status}
                  </span>
                </div>
                {farm && (
                  <div className="absolute top-3 left-3">
                    <span className="badge badge-gray">{farm.plot_id}</span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-dark">{crop.name}</h3>
                    {crop.variety && <p className="text-xs text-gray-500">{crop.variety}</p>}
                  </div>
                  <div className={`text-xl font-bold ${getHealthColor(crop.health_index)}`}>
                    {crop.health_index}%
                  </div>
                </div>

                {/* Growth Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>{crop.growth_stage || 'Germination'}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <Droplets className="w-4 h-4 text-info mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Water</p>
                    <p className="text-sm font-medium">{crop.water_requirement_liters_per_day || 0}L</p>
                  </div>
                  <div className="text-center">
                    <Leaf className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Area</p>
                    <p className="text-sm font-medium">{crop.area_allocated_sqm || 0}m²</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-4 h-4 text-accent mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Yield</p>
                    <p className="text-sm font-medium">{crop.expected_yield_kg || 0}kg</p>
                  </div>
                </div>

                {/* Projected Income */}
                {projectedIncome > 0 && (
                  <div className="mb-4 p-3 bg-green-50 rounded-xl">
                    <p className="text-xs text-green-600">Projected Income</p>
                    <p className="text-lg font-bold text-green-700">{formatCurrency(projectedIncome)}</p>
                  </div>
                )}

                {/* Days to Harvest */}
                {daysToHarvest !== null && daysToHarvest > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>{daysToHarvest} days to harvest</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/crops/${crop.id}`} className="flex-1">
                    <motion.button
                      className="w-full flex items-center justify-center gap-1 py-2 text-sm font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </motion.button>
                  </Link>
                  <motion.button
                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {filteredCrops.length === 0 && !loading && (
        <div className="text-center py-16">
          <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">No crops found</h3>
          <p className="text-sm text-gray-400 mt-1">Add your first crop to get started</p>
        </div>
      )}

      {/* Add Crop Modal */}
      <AnimatePresence>
        {showModal && <AddCropModal farms={farms} onClose={() => setShowModal(false)} onAdded={loadData} />}
      </AnimatePresence>
    </div>
  )
}

function AddCropModal({
  farms,
  onClose,
  onAdded,
}: {
  farms: Farm[]
  onClose: () => void
  onAdded: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    crop_type: 'vegetable',
    season: 'kharif',
    sowing_date: '',
    expected_harvest_date: '',
    area_allocated_sqm: '',
    water_requirement_liters_per_day: '',
    expected_yield_kg: '',
    market_price_per_kg: '',
    farm_id: farms[0]?.id || '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { error } = await supabase.from('crops').insert({
        ...formData,
        area_allocated_sqm: parseFloat(formData.area_allocated_sqm),
        water_requirement_liters_per_day: parseFloat(formData.water_requirement_liters_per_day),
        expected_yield_kg: parseFloat(formData.expected_yield_kg),
        market_price_per_kg: parseFloat(formData.market_price_per_kg),
      })
      if (error) throw error
      toast.success('Crop added successfully!')
      onAdded()
      onClose()
    } catch (error: unknown) {
      toast.error(`Failed to add crop: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-dark">Add New Crop</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
              <input
                required
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Tomato"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Variety</label>
              <input
                className="input-field"
                value={formData.variety}
                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                placeholder="e.g., Cherry"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
              <select
                className="select-field"
                value={formData.crop_type}
                onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
              >
                <option value="vegetable">Vegetable</option>
                <option value="grain">Grain</option>
                <option value="fruit">Fruit</option>
                <option value="cash_crop">Cash Crop</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
              <select
                className="select-field"
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              >
                <option value="kharif">Kharif</option>
                <option value="rabi">Rabi</option>
                <option value="zaid">Zaid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Farm</label>
            <select
              className="select-field"
              value={formData.farm_id}
              onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
            >
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name} ({farm.plot_id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sowing Date</label>
              <input
                required
                type="date"
                className="input-field"
                value={formData.sowing_date}
                onChange={(e) => setFormData({ ...formData, sowing_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Harvest</label>
              <input
                type="date"
                className="input-field"
                value={formData.expected_harvest_date}
                onChange={(e) => setFormData({ ...formData, expected_harvest_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area (m²)</label>
              <input
                type="number"
                className="input-field"
                value={formData.area_allocated_sqm}
                onChange={(e) => setFormData({ ...formData, area_allocated_sqm: e.target.value })}
                placeholder="200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Water (L/day)</label>
              <input
                type="number"
                className="input-field"
                value={formData.water_requirement_liters_per_day}
                onChange={(e) => setFormData({ ...formData, water_requirement_liters_per_day: e.target.value })}
                placeholder="50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Yield (kg)</label>
              <input
                type="number"
                className="input-field"
                value={formData.expected_yield_kg}
                onChange={(e) => setFormData({ ...formData, expected_yield_kg: e.target.value })}
                placeholder="150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Market Price (₹/kg)</label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                value={formData.market_price_per_kg}
                onChange={(e) => setFormData({ ...formData, market_price_per_kg: e.target.value })}
                placeholder="80"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              Add Crop
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

