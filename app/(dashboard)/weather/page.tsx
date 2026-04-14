'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CloudSun, Thermometer, Droplets, Wind, Sun, CloudRain, Compass, Sparkles, Plus, Loader2, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { fetchCurrentWeather, fetchForecast, WeatherResponse, ForecastDay } from '@/lib/weather'
import type { WeatherData, Farm } from '@/types'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

const containerVariants = {
  animate: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function WeatherPage() {
  const { user } = useAuth()
  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [farms, setFarms] = useState<Farm[]>([])
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [farmerLocation, setFarmerLocation] = useState<string | null>(null)
  const [currentWeather, setCurrentWeather] = useState<WeatherResponse | null>(null)
  const [forecast, setForecast] = useState<ForecastDay[]>([])
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [formData, setFormData] = useState({
    temperature_celsius: '',
    humidity_percent: '',
    wind_speed_mps: '',
    wind_direction: 'NE',
    rainfall_mm: '',
    uv_index: '',
    sunlight_hours: '',
    weather_condition: 'sunny',
    forecast_rain_probability: '',
    high_temp: '',
    low_temp: '',
  })

  useEffect(() => {
    loadData()
    loadFarmerLocation()
  }, [])

  async function loadFarmerLocation() {
    if (!user) return
    try {
      const { data } = await supabase
        .from('farmers')
        .select('location')
        .eq('email', user.email)
        .single()
      
      if (data?.location) {
        setFarmerLocation(data.location)
        const [weather, forecastData] = await Promise.all([
          fetchCurrentWeather(data.location),
          fetchForecast(data.location, 7)
        ])
        setCurrentWeather(weather)
        setForecast(forecastData)
      }
    } catch (error) {
      console.error('Error loading weather:', error)
    } finally {
      setWeatherLoading(false)
    }
  }

  useEffect(() => {
    if (farms.length > 0 && !selectedFarm) setSelectedFarm(farms[0].id)
  }, [farms])

  async function loadData() {
    try {
      const [weatherRes, farmsRes] = await Promise.all([
        supabase.from('weather_data').select('*').order('recorded_at', { ascending: false }).limit(30),
        supabase.from('farms').select('*'),
      ])
      if (weatherRes.data) setWeatherData(weatherRes.data)
      if (farmsRes.data) setFarms(farmsRes.data)
    } catch (error) {
      console.error('Error loading weather:', error)
    } finally {
      setLoading(false)
    }
  }

  const latest = weatherData.find((w) => w.farm_id === selectedFarm) || weatherData[0]
  const farmWeather = weatherData.filter((w) => w.farm_id === selectedFarm).slice(0, 14).reverse()

  const weatherHistory = farmWeather.map((w) => ({
    date: new Date(w.recorded_at).toLocaleDateString('en', { weekday: 'short' }),
    temp: Number(w.temperature_celsius) || 0,
    humidity: Number(w.humidity_percent) || 0,
    rainfall: Number(w.rainfall_mm) || 0,
  }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFarm) return
    try {
      const { error } = await supabase.from('weather_data').insert({
        farm_id: selectedFarm,
        temperature_celsius: parseFloat(formData.temperature_celsius) || null,
        humidity_percent: parseFloat(formData.humidity_percent) || null,
        wind_speed_mps: parseFloat(formData.wind_speed_mps) || null,
        wind_direction: formData.wind_direction,
        rainfall_mm: parseFloat(formData.rainfall_mm) || 0,
        uv_index: parseFloat(formData.uv_index) || null,
        sunlight_hours: parseFloat(formData.sunlight_hours) || null,
        weather_condition: formData.weather_condition,
        forecast_rain_probability: parseInt(formData.forecast_rain_probability) || null,
        high_temp: parseFloat(formData.high_temp) || null,
        low_temp: parseFloat(formData.low_temp) || null,
      })
      if (error) throw error
      toast.success('Weather data added!')
      setShowForm(false)
      loadData()
    } catch (error: unknown) {
      toast.error(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const recommendations = [
    { text: 'Today is ideal for fertilizer application', confidence: 92, icon: '🌱' },
    { text: latest && latest.wind_speed_mps && latest.wind_speed_mps > 5 ? 'Avoid spraying - wind speed too high' : 'Good conditions for spraying', confidence: 85, icon: '🧴' },
    { text: 'Pre-irrigate before expected rainfall on Wednesday', confidence: 78, icon: '💧' },
  ]

  return (
    <motion.div variants={containerVariants} initial="initial" animate="animate" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark">Weather Center</h2>
          <p className="text-sm text-gray-500 mt-1">Real-time weather monitoring and forecasts</p>
        </div>
        <motion.button className="btn-primary flex items-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Add Data
        </motion.button>
      </div>

      {/* Farm Selector */}
      <div className="flex gap-2">
        {farms.map((farm) => (
          <button key={farm.id} onClick={() => setSelectedFarm(farm.id)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedFarm === farm.id ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {farm.name}
          </button>
        ))}
      </div>

      {/* Hero Weather Card */}
      {weatherLoading ? (
        <motion.div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-8 text-white flex items-center justify-center min-h-[200px]" variants={cardVariants}>
          <Loader2 className="w-8 h-8 animate-spin" />
        </motion.div>
      ) : currentWeather ? (
        <motion.div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-8 text-white" variants={cardVariants}>
          <div className="absolute top-4 right-4 text-7xl">
            {currentWeather.condition.toLowerCase().includes('sun') || currentWeather.condition.toLowerCase().includes('clear') ? '☀️' : currentWeather.condition.toLowerCase().includes('rain') ? '🌧️' : currentWeather.condition.toLowerCase().includes('cloud') ? '☁️' : '🌤️'}
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{farmerLocation}</span>
            </div>
            <p className="text-6xl font-bold mt-2">{currentWeather.temp}°C</p>
            <p className="text-xl text-white/80 mt-1 capitalize">{currentWeather.description || currentWeather.condition}</p>
            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                <span>H: {currentWeather.high}° / L: {currentWeather.low}°</span>
              </div>
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4" />
                <span>Humidity: {currentWeather.humidity}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-8 text-white" variants={cardVariants}>
          <div className="relative z-10">
            <p className="text-white/80 text-sm">Current Weather</p>
            <p className="text-6xl font-bold mt-2">{latest?.temperature_celsius || 32}°C</p>
            <p className="text-xl text-white/80 mt-1 capitalize">{latest?.weather_condition || 'Sunny'}</p>
          </div>
        </motion.div>
      )}

      {/* 7-Day Forecast */}
      <motion.div className="glass-card p-6" variants={cardVariants}>
        <h3 className="font-semibold text-dark mb-4">7-Day Forecast</h3>
        <div className="grid grid-cols-7 gap-3">
          {forecast.length > 0 ? forecast.map((day, i) => (
            <motion.div
              key={day.date}
              className="text-center p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <p className="text-sm font-medium text-gray-600">{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</p>
              <span className="text-2xl my-2 block">{day.condition.toLowerCase().includes('sun') || day.condition.toLowerCase().includes('clear') ? '☀️' : day.condition.toLowerCase().includes('rain') ? '🌧️' : day.condition.toLowerCase().includes('cloud') ? '☁️' : '🌤️'}</span>
              <p className="text-lg font-bold text-dark">{day.temp}°</p>
            </motion.div>
          )) : (
            <div className="col-span-7 text-center py-4 text-gray-500">
              No forecast data available. Add your location in Settings.
            </div>
          )}
        </div>
      </motion.div>

      {/* Weather Metrics Grid */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div className="glass-card p-5" variants={cardVariants}>
          <div className="flex items-center gap-3 mb-3">
            <Droplets className="w-5 h-5 text-info" />
            <span className="text-sm text-gray-500">Humidity</span>
          </div>
          <p className="text-3xl font-bold text-dark">{currentWeather?.humidity || latest?.humidity_percent || 65}%</p>
        </motion.div>
        <motion.div className="glass-card p-5" variants={cardVariants}>
          <div className="flex items-center gap-3 mb-3">
            <Wind className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-500">Wind Speed</span>
          </div>
          <p className="text-3xl font-bold text-dark">{currentWeather?.wind_speed || latest?.wind_speed_mps || 3.2} <span className="text-sm font-normal text-gray-500">m/s</span></p>
          <p className="text-xs text-gray-500 mt-1">Direction: {latest?.wind_direction || 'NE'}</p>
        </motion.div>
        <motion.div className="glass-card p-5" variants={cardVariants}>
          <div className="flex items-center gap-3 mb-3">
            <Sun className="w-5 h-5 text-accent" />
            <span className="text-sm text-gray-500">Sunlight Hours</span>
          </div>
          <p className="text-3xl font-bold text-dark">{latest?.sunlight_hours || 8.5} <span className="text-sm font-normal text-gray-500">hrs</span></p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <motion.div className="glass-card p-6" variants={cardVariants}>
          <h3 className="font-semibold text-dark mb-4">Temperature Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weatherHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip />
              <Line type="monotone" dataKey="temp" stroke="#f39c12" strokeWidth={3} dot={{ fill: '#f39c12', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div className="glass-card p-6" variants={cardVariants}>
          <h3 className="font-semibold text-dark mb-4">Rainfall</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weatherHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip />
              <Bar dataKey="rainfall" fill="#3498db" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* AI Recommendations */}
      <motion.div className="glass-card-dark p-6 text-white" variants={cardVariants}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Weather-Based Recommendations</h3>
        </div>
        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <div key={i} className="p-4 bg-white/10 rounded-xl flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="text-xl">{rec.icon}</span>
                <p className="text-sm text-white/90">{rec.text}</p>
              </div>
              <span className="text-xs text-accent font-medium whitespace-nowrap ml-4">{rec.confidence}%</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Add Weather Modal */}
      {showForm && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div className="bg-white rounded-2xl w-full max-w-lg m-4 p-6" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <h2 className="text-xl font-bold text-dark mb-6">Add Weather Data</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
                  <input type="number" step="0.1" className="input-field" value={formData.temperature_celsius} onChange={(e) => setFormData({ ...formData, temperature_celsius: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Humidity (%)</label>
                  <input type="number" className="input-field" value={formData.humidity_percent} onChange={(e) => setFormData({ ...formData, humidity_percent: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wind Speed (m/s)</label>
                  <input type="number" step="0.1" className="input-field" value={formData.wind_speed_mps} onChange={(e) => setFormData({ ...formData, wind_speed_mps: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select className="select-field" value={formData.weather_condition} onChange={(e) => setFormData({ ...formData, weather_condition: e.target.value })}>
                    <option value="sunny">Sunny</option>
                    <option value="cloudy">Cloudy</option>
                    <option value="rainy">Rainy</option>
                    <option value="windy">Windy</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Add Data</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

