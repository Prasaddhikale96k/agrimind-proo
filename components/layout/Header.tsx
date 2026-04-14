'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Bell, CloudSun, ChevronDown, MapPin, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { fetchCurrentWeather, WeatherResponse } from '@/lib/weather'

export default function Header({ title }: { title: string }) {
  const { user } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [weather, setWeather] = useState<WeatherResponse | null>(null)
  const [location, setLocation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const initials = user?.email
    ? user.email.split('@')[0].slice(0, 2).toUpperCase()
    : 'RK'

  useEffect(() => {
    loadWeather()
  }, [user])

  async function loadWeather() {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const { data } = await supabase
        .from('farmers')
        .select('location')
        .eq('email', user.email)
        .single()
      
      if (data?.location) {
        setLocation(data.location)
        const weatherData = await fetchCurrentWeather(data.location)
        setWeather(weatherData)
      }
    } catch (error) {
      console.error('Error loading weather:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Title */}
        <motion.h1
          key={title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-dark"
        >
          {title}
        </motion.h1>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search crops, farms, reports..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Weather Mini */}
          <motion.div
            className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl text-sm"
            whileHover={{ scale: 1.02 }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            ) : weather ? (
              <>
                <CloudSun className="w-4 h-4 text-accent" />
                <span className="font-medium text-dark">{weather.temp}°C</span>
                <span className="text-subtle">{weather.condition}</span>
              </>
            ) : (
              <>
                <CloudSun className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">--°C</span>
              </>
            )}
          </motion.div>

          {/* Location */}
          {location && (
            <motion.div
              className="flex items-center gap-1 px-3 py-2 text-xs text-gray-500"
              whileHover={{ scale: 1.02 }}
            >
              <MapPin className="w-3 h-3" />
              <span>{location}</span>
            </motion.div>
          )}

          {/* Notifications */}
          <div className="relative">
            <motion.button
              className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <motion.span
                className="absolute top-1 right-1 w-2.5 h-2.5 bg-warning rounded-full border-2 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>
          </div>

          {/* User Menu */}
          <motion.button
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-colors"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {initials}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.button>
        </div>
      </div>
    </header>
  )
}
