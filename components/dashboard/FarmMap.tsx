'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { MapPin, Droplets, Leaf } from 'lucide-react'

const plots = [
  {
    id: 'PL-ODL',
    name: 'Tomato Garden',
    x: 25,
    y: 30,
    width: 35,
    height: 40,
    crop: 'Cherry Tomato',
    health: 94,
    moisture: 28,
    color: '#1a7a4a',
  },
  {
    id: 'CL-ODL',
    name: 'Wheat Field',
    x: 65,
    y: 25,
    width: 30,
    height: 45,
    crop: 'HD-2967 Wheat',
    health: 87,
    moisture: 45,
    color: '#2ecc71',
  },
  {
    id: 'PL-B',
    name: 'Rice Paddy',
    x: 20,
    y: 75,
    width: 40,
    height: 20,
    crop: 'Basmati Rice',
    health: 72,
    moisture: 65,
    color: '#f39c12',
  },
]

export default function FarmMap({ onPlotSelect }: { onPlotSelect?: (plot: typeof plots[0]) => void }) {
  const [selectedPlot, setSelectedPlot] = useState<string | null>(null)

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-dark">Farm Overview</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin className="w-4 h-4" />
          <span>3 Active Plots</span>
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl overflow-hidden aspect-[4/3]">
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a7a4a" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Farm plots */}
        {plots.map((plot, i) => (
          <motion.div
            key={plot.id}
            className="absolute cursor-pointer"
            style={{
              left: `${plot.x}%`,
              top: `${plot.y}%`,
              width: `${plot.width}%`,
              height: `${plot.height}%`,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedPlot(plot.id)
              onPlotSelect?.(plot)
            }}
          >
            <motion.div
              className={`w-full h-full rounded-xl border-2 transition-colors ${
                selectedPlot === plot.id
                  ? 'border-primary bg-primary/20'
                  : 'border-white/50 bg-white/30'
              }`}
              animate={{
                boxShadow: selectedPlot === plot.id
                  ? '0 0 20px rgba(26, 122, 74, 0.3)'
                  : '0 0 0px rgba(26, 122, 74, 0)',
              }}
            >
              <div className="p-3 h-full flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-dark">{plot.id}</p>
                  <p className="text-[10px] text-gray-600">{plot.name}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Leaf className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-medium text-primary">{plot.health}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-info" />
                    <span className="text-[10px] font-medium text-info">{plot.moisture}%</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Pulse animation for selected */}
            {selectedPlot === plot.id && (
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-primary"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

