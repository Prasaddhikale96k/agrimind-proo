'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Leaf,
  Wind,
  Thermometer,
  Droplets,
  Beaker,
  Sun,
  Sparkles,
  ArrowRight,
  ChevronRight,
  MessageSquare,
  Send,
  ImagePlus,
  Loader2,
} from 'lucide-react'
import WeatherHero from '@/components/dashboard/WeatherHero'
import MetricCard from '@/components/dashboard/MetricCard'
import FarmMap from '@/components/dashboard/FarmMap'
import AnimatedCounter from '@/components/shared/AnimatedCounter'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { fetchCurrentWeather, WeatherResponse } from '@/lib/weather'
import type { Crop, SoilData, WeatherData } from '@/types'

const containerVariants = {
  animate: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [crops, setCrops] = useState<Crop[]>([])
  const [soilData, setSoilData] = useState<SoilData[]>([])
  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [loading, setLoading] = useState(true)
  const [aiMessage, setAiMessage] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [selectedPlot, setSelectedPlot] = useState<string | null>(null)
  const [farmerLocation, setFarmerLocation] = useState<string | null>(null)
  const [currentWeather, setCurrentWeather] = useState<WeatherResponse | null>(null)

  useEffect(() => {
    loadData()
    loadFarmerLocation()
  }, [])

  async function loadFarmerLocation() {
    try {
      const { data } = await supabase
        .from('farmers')
        .select('location')
        .eq('email', user?.email)
        .single()
      
      if (data?.location) {
        setFarmerLocation(data.location)
        const weather = await fetchCurrentWeather(data.location)
        setCurrentWeather(weather)
      }
    } catch (error) {
      console.error('Error loading farmer location:', error)
    }
  }

  async function loadData() {
    try {
      const [cropsRes, soilRes, weatherRes] = await Promise.all([
        supabase.from('crops').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('soil_data').select('*').order('recorded_at', { ascending: false }).limit(7),
        supabase.from('weather_data').select('*').order('recorded_at', { ascending: false }).limit(1),
      ])

      if (cropsRes.data) setCrops(cropsRes.data)
      if (soilRes.data) setSoilData(soilRes.data)
      if (weatherRes.data) setWeatherData(weatherRes.data)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const latestSoil = soilData[0]
  const latestWeather = weatherData[0]
  const avgHealth = crops.length > 0 ? Math.round(crops.reduce((sum, c) => sum + c.health_index, 0) / crops.length) : 0

  async function handleAiChat() {
    if (!aiMessage.trim()) return
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: aiMessage }),
      })
      const data = await res.json()
      setAiResponse(data.response || 'Unable to get AI response')
    } catch {
      setAiResponse('Failed to connect to AI. Please try again.')
    }
    setAiMessage('')
  }

  const cropRows = [
    { label: 'Crop Health Index', value: `${avgHealth}%`, icon: Leaf, color: 'text-primary', status: avgHealth >= 80 ? 'Good' : 'Warning' },
    { label: 'Soil Moisture', value: `${latestSoil?.moisture_percent || 42}%`, icon: Droplets, color: 'text-info', status: latestSoil && latestSoil.moisture_percent && latestSoil.moisture_percent > 30 ? 'Good' : 'Warning' },
    { label: 'Temperature', value: `${currentWeather?.temp || latestWeather?.temperature_celsius || 32}°C`, icon: Thermometer, color: 'text-accent' },
    { label: 'Sunlight Exposure', value: `${latestWeather?.sunlight_hours || 8.5} hrs`, icon: Sun, color: 'text-accent' },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Main Grid */}
      <div className="grid grid-cols-5 gap-6">
        {/* LEFT PANEL (60%) */}
        <div className="col-span-3 space-y-6">
          {/* Weather Hero */}
          <WeatherHero
            temperature={currentWeather?.temp || latestWeather?.temperature_celsius || 32}
            condition={currentWeather?.condition || latestWeather?.weather_condition || 'Sunny'}
            humidity={currentWeather?.humidity || latestWeather?.humidity_percent || 65}
            windSpeed={currentWeather?.wind_speed || latestWeather?.wind_speed_mps || 3.2}
            high={currentWeather?.high || latestWeather?.high_temp || 35}
            low={currentWeather?.low || latestWeather?.low_temp || 24}
            location={farmerLocation || undefined}
          />

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-3 gap-4">
            <MetricCard
              icon={Leaf}
              label="Plant Health"
              value={`${avgHealth}%`}
              status={avgHealth >= 80 ? 'Good' : 'Warning'}
              color="primary"
              delay={0.1}
            />
            <MetricCard
              icon={Wind}
              label="Wind Speed"
              value={latestWeather?.wind_speed_mps || 3.2}
              unit="m/s"
              color="info"
              delay={0.2}
            />
            <MetricCard
              icon={Thermometer}
              label="Temperature"
              value={latestWeather?.temperature_celsius || 32}
              unit="°C"
              color="accent"
              delay={0.3}
            />
            <MetricCard
              icon={Beaker}
              label="pH Level"
              value={latestSoil?.ph_level || 6.8}
              status={latestSoil && latestSoil.ph_level && latestSoil.ph_level >= 5.5 && latestSoil.ph_level <= 7.5 ? 'Good' : 'Warning'}
              color="secondary"
              delay={0.4}
            />
            <MetricCard
              icon={Droplets}
              label="Humidity"
              value={latestWeather?.humidity_percent || 65}
              unit="%"
              color="info"
              delay={0.5}
            />
            <MetricCard
              icon={Droplets}
              label="Soil Moisture"
              value={latestSoil?.moisture_percent || 42}
              unit="%"
              status={latestSoil && latestSoil.moisture_percent && latestSoil.moisture_percent > 30 ? 'Good' : 'Critical'}
              color="primary"
              delay={0.6}
            />
          </div>

          {/* Farm Map */}
          <FarmMap onPlotSelect={(plot) => setSelectedPlot(plot.id)} />
        </div>

        {/* RIGHT PANEL (40%) */}
        <div className="col-span-2 space-y-6">
          {/* AI Message */}
          <motion.div
            className="glass-card p-5"
            variants={cardVariants}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-dark">AI Insights</h3>
            </div>
            <p className="text-sm text-gray-600">
              Your crops are thriving today! The overall health index is <span className="font-semibold text-primary">{avgHealth}%</span>.
              {latestSoil && latestSoil.moisture_percent && latestSoil.moisture_percent < 30 && (
                <span className="block mt-2 text-warning font-medium">
                  ⚠️ Low soil moisture detected. Immediate irrigation recommended.
                </span>
              )}
            </p>
          </motion.div>

          {/* Crop Metrics */}
          <motion.div
            className="glass-card p-5"
            variants={cardVariants}
          >
            <h3 className="font-semibold text-dark mb-4">Farm Metrics</h3>
            <div className="space-y-3">
              {cropRows.map((row, i) => (
                <motion.div
                  key={row.label}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-100 ${row.color}`}>
                      <row.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark">{row.label}</p>
                      {row.status && (
                        <span className={`text-xs ${
                          row.status === 'Good' ? 'text-green-500' : 'text-yellow-500'
                        }`}>
                          {row.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-dark">{row.value}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Active Crops */}
          <motion.div
            className="glass-card p-5"
            variants={cardVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-dark">Active Crops</h3>
              <span className="text-sm text-gray-500">{crops.length} crops</span>
            </div>
            <div className="space-y-3">
              {crops.slice(0, 4).map((crop, i) => (
                <motion.div
                  key={crop.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-lg">
                    {crop.crop_type === 'vegetable' ? '🍅' : crop.crop_type === 'grain' ? '🌾' : '🌿'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark truncate">{crop.name}</p>
                    <p className="text-xs text-gray-500">{crop.growth_stage || 'Growing'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      crop.health_index >= 80 ? 'text-green-500' : crop.health_index >= 60 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {crop.health_index}%
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* AI Chat Card */}
          <motion.div
            className="glass-card-dark p-5 text-white"
            variants={cardVariants}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">AI Crop Analysis</h3>
            </div>

            {/* AI Response */}
            {aiResponse && (
              <motion.div
                className="mb-4 p-4 bg-white/10 rounded-xl text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-white/90">{aiResponse}</p>
              </motion.div>
            )}

            {/* Image Upload CTA */}
            <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <ImagePlus className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-sm font-medium">Upload crop image</p>
                  <p className="text-xs text-white/60">AI will analyze for diseases & health</p>
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiChat()}
                placeholder="Ask AI about your farm..."
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
              />
              <motion.button
                className="p-3 bg-accent hover:bg-amber-500 rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAiChat}
              >
                <Send className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

