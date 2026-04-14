'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Check } from 'lucide-react'
import { CROP_OPTIONS, CROP_CATEGORIES } from '@/lib/fassal-deal/crop-data'

export default function Step1CropSelect({
  selectedCrop,
  onSelect,
  onNext,
}: {
  selectedCrop: any
  onSelect: (crop: any) => void
  onNext: () => void
}) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = CROP_OPTIONS.filter((crop) => {
    const matchesSearch =
      crop.name.toLowerCase().includes(search.toLowerCase()) ||
      crop.nameHindi.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'All' || crop.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Kaun si Fasal Bechni Hai? 🌾</h2>
        <p className="text-gray-500 mt-2">Select your crop to begin</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search crop... (e.g., Tomato, Gehu, Pyaaz)"
          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {CROP_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Crop Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8 max-h-[400px] overflow-y-auto">
        {filtered.map((crop, i) => (
          <motion.button
            key={crop.name}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onSelect(crop)}
            className={`relative p-4 rounded-xl border-2 text-center transition-all hover:scale-105 ${
              selectedCrop?.name === crop.name
                ? 'border-green-600 bg-green-50 shadow-md'
                : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
            }`}
          >
            {selectedCrop?.name === crop.name && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <div className="text-3xl mb-2">{crop.emoji}</div>
            <p className="text-sm font-medium text-gray-900">{crop.name}</p>
            <p className="text-xs text-gray-500">{crop.nameHindi}</p>
            <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              crop.trend === 'rising' ? 'bg-green-100 text-green-700' :
              crop.trend === 'falling' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              ₹{crop.avgPrice.toLocaleString('en-IN')}/q
              {crop.trend === 'rising' ? ' ↑' : crop.trend === 'falling' ? ' ↓' : ' →'}
            </div>
          </motion.button>
        ))}
      </div>

      {selectedCrop && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200"
        >
          <p className="text-sm text-green-800">
            ✅ Selected: <strong>{selectedCrop.name}</strong> ({selectedCrop.nameHindi}) | 
            Current Range: ₹{Math.round(selectedCrop.avgPrice * 0.8).toLocaleString('en-IN')} - ₹{Math.round(selectedCrop.avgPrice * 1.2).toLocaleString('en-IN')}/q
          </p>
          <p className="text-xs text-green-600 mt-1">
            📊 {selectedCrop.name} prices are {selectedCrop.trend.toUpperCase()} this week ({selectedCrop.trendPercent}%).
            {selectedCrop.trend === 'rising' ? ' Good time to sell!' : ''}
          </p>
        </motion.div>
      )}

      <button
        onClick={onNext}
        disabled={!selectedCrop}
        className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Agla Step →
      </button>
    </div>
  )
}
