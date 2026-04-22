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
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { SkeletonCard, EmptyState } from '@/components/shared/LoadingSkeleton'
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
  const { user } = useAuth()

  const [crops, setCrops] = useState<Crop[]>([])
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

async function loadData() {
    if (!user) return

    try {
      setLoading(true)

      // Get user's farms
       const { data: farmsData, error: farmsError } = await supabase
         .from('farms')
         .select('*')
         .eq('user_id', user.id) as { data: Farm[] | null; error: Error | null }

      if (farmsError) throw farmsError
      setFarms(farmsData || [])

      if (farmsData && farmsData.length > 0) {
        const farmIds = farmsData.map((f: Farm) => f.id)

        // Get crops for user's farms
         const { data: cropsData, error: cropsError } = await supabase
           .from('crops')
           .select('*')
           .in('farm_id', farmIds)
           .order('created_at', { ascending: false }) as { data: Crop[] | null; error: Error | null }

        if (cropsError) throw cropsError
        setCrops(cropsData || [])
      } else {
        setCrops([])
      }
    } catch (error) {
      console.error('Error loading crops:', error)
      toast.error('Failed to load crops')
    } finally {
      setLoading(false)
    }
  }

  // Supabase Realtime
  useEffect(() => {
    if (!user || farms.length === 0) return

    const farmIds = farms.map(f => f.id)

    const channel = supabase
      .channel('crops-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'crops', filter: `farm_id=in.(${farmIds.map(id => `'${id}'`).join(',')})` },
        () => loadData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, farms, supabase])

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-100 rounded w-40 animate-pulse" />
          <div className="h-10 bg-gray-100 rounded-xl w-28 animate-pulse" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 bg-gray-100 rounded-xl w-24 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

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
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.key
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

      {/* Empty State */}
      {(crops.length === 0 && !loading) && (
        farms.length === 0 ? (
          <EmptyState
            icon="crops"
            title="No farms or crops yet"
            description="Get started by setting up your first farm and adding crops to see your dashboard come to life."
            actionLabel="Add Your First Farm"
            onAction={() => window.location.href = '/onboarding'}
          />
        ) : (
          <EmptyState
            icon="crops"
            title="No crops added yet"
            description="Start tracking your crops to get AI-powered insights and monitor their growth."
            actionLabel="Add Your First Crop"
            onAction={() => setShowModal(true)}
          />
        )
      )}

      {/* Crop Cards Grid */}
      {crops.length > 0 && (
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
      )}

      {filteredCrops.length === 0 && crops.length > 0 && !loading && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">No matching crops</h3>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Add Crop Modal */}
      <AnimatePresence>
        {showModal && (
          <AddCropModal
            farms={farms}
            onClose={() => setShowModal(false)}
            onAdded={loadData}
          />
        )}
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
  const { user } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [selectedFarmId, setSelectedFarmId] = useState(farms[0]?.id || '')
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

  // Update farm_id when dropdown changes
  const handleFarmChange = (farmId: string) => {
    setSelectedFarmId(farmId)
    setFormData({ ...formData, farm_id: farmId })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!user) {
      toast.error('You must be logged in')
      return
    }

    if (!formData.name || !formData.sowing_date) {
      toast.error('Please fill required fields')
      return
    }

    // If no farms exist, create one first
    let farmId = formData.farm_id
    if (!farmId && user) {
      toast.error('Please create a farm first')
      return
    }

    setSubmitting(true)

    try {
      const cropData = {
        farm_id: farmId,
        name: formData.name.trim(),
        variety: formData.variety.trim() || null,
        crop_type: formData.crop_type,
        season: formData.season,
        sowing_date: formData.sowing_date,
        expected_harvest_date: formData.expected_harvest_date || null,
        area_allocated_sqm: formData.area_allocated_sqm ? parseFloat(formData.area_allocated_sqm) : null,
        water_requirement_liters_per_day: formData.water_requirement_liters_per_day ? parseFloat(formData.water_requirement_liters_per_day) : null,
        expected_yield_kg: formData.expected_yield_kg ? parseFloat(formData.expected_yield_kg) : null,
        market_price_per_kg: formData.market_price_per_kg ? parseFloat(formData.market_price_per_kg) : null,
        status: 'growing',
        health_index: 85,
        growth_stage: 'Germination',
      }
      const { error } = await supabase.from('crops').insert(cropData as any)

      if (error) throw error

      toast.success('Crop added successfully!')
      onAdded()
      onClose()
    } catch (error: unknown) {
      console.error('Error adding crop:', error)
      toast.error(`Failed to add crop: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSubmitting(false)
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
          {/* Plot/Plot Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Plot *</label>
            <select
              required
              className="select-field"
              value={selectedFarmId}
              onChange={(e) => handleFarmChange(e.target.value)}
            >
              <option value="">Choose a plot...</option>
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name} ({farm.plot_id || 'Plot'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Farm *</label>
            {farms.length === 0 ? (
              <p className="text-sm text-red-500">Please create a farm first</p>
            ) : (
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
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sowing Date *</label>
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
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Crop'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
