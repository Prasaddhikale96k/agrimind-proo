'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Bell, CloudSun, ChevronDown, MapPin, Loader2, Menu, PanelLeftClose, PanelLeft } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { fetchCurrentWeather, WeatherResponse } from '@/lib/weather'

interface HeaderProps {
  title: string
  onMenuClick?: () => void
  hideSidebarToggle?: boolean
}

export default function Header({ title, onMenuClick, hideSidebarToggle }: HeaderProps) {
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
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 lg:px-8 py-3 lg:py-4">
      <div className="flex items-center justify-between gap-2 lg:gap-0">
        {/* Mobile Menu Button */}
        {!hideSidebarToggle && onMenuClick && (
          <motion.button
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg touch-target flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMenuClick}
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </motion.button>
        )}

        {/* Left: Title */}
        <motion.h1
          key={title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-lg lg:text-2xl font-bold text-dark flex-1 lg:flex-none truncate"
        >
          {title}
        </motion.h1>

        {/* Center: Search - Hidden on mobile, visible on tablet+ */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search crops, farms, reports..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 lg:gap-3">
          {/* Weather Mini - Compact on mobile */}
          <motion.div
            className="hidden sm:flex items-center gap-2 lg:gap-3 px-2 lg:px-4 py-1.5 lg:py-2 bg-gray-50 rounded-xl text-xs lg:text-sm"
            whileHover={{ scale: 1.02 }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            ) : weather ? (
              <>
                <CloudSun className="w-4 h-4 text-accent" />
                <span className="font-medium text-dark hidden lg:inline">{weather.temp}°C</span>
                <span className="text-subtle hidden lg:inline">{weather.condition}</span>
                <span className="font-medium text-dark lg:hidden">{weather.temp}°</span>
              </>
            ) : (
              <>
                <CloudSun className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 hidden lg:inline">--°C</span>
                <span className="text-gray-400 lg:hidden">--°</span>
              </>
            )}
          </motion.div>

          {/* Location - Hidden on small mobile */}
          {location && (
            <motion.div
              className="hidden sm:flex items-center gap-1 px-2 lg:px-3 py-1.5 lg:py-2 text-xs text-gray-500"
              whileHover={{ scale: 1.02 }}
            >
              <MapPin className="w-3 h-3" />
              <span className="hidden md:inline">{location}</span>
            </motion.div>
          )}

          {/* Notifications */}
          <div className="relative">
            <motion.button
              className="relative p-2 hover:bg-gray-100 rounded-lg touch-target flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <motion.span
                className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-warning rounded-full border-2 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>
          </div>

          {/* User Menu */}
          <motion.button
            className="flex items-center gap-1 lg:gap-2 p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg touch-target"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-7 lg:w-8 h-7 lg:h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {initials}
            </div>
            <ChevronDown className="w-3 lg:w-4 h-3 lg:h-4 text-gray-400 hidden lg:flex" />
          </motion.button>
        </div>
      </div>
    </header>
  )
}
