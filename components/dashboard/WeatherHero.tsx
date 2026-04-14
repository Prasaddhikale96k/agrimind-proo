'use client'

import { motion } from 'framer-motion'
import { CloudSun, Thermometer, Wind, Droplets, MapPin } from 'lucide-react'

export default function WeatherHero({
  temperature = 32,
  condition = 'Sunny',
  humidity = 65,
  windSpeed = 3.2,
  high = 35,
  low = 24,
  location,
}: {
  temperature?: number
  condition?: string
  humidity?: number
  windSpeed?: number
  high?: number
  low?: number
  location?: string
}) {
  const getWeatherEmoji = (c: string) => {
    switch (c.toLowerCase()) {
      case 'sunny':
      case 'clear': return '☀️'
      case 'cloudy': return '☁️'
      case 'rainy':
      case 'rain': return '🌧️'
      case 'thunderstorm': return '⛈️'
      case 'snow': return '❄️'
      case 'mist':
      case 'fog': return '🌫️'
      default: return '🌤️'
    }
  }

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 text-slate-900"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100/50 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-100/30 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Current Weather</p>
            <div className="flex items-center gap-5 mt-2">
              <motion.span
                className="text-5xl"
                animate={{ rotate: condition.toLowerCase() === 'sunny' ? 360 : 0 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                {getWeatherEmoji(condition)}
              </motion.span>
              <div>
                <p className="text-4xl font-bold text-slate-900">{temperature}°C</p>
                <p className="text-slate-600 text-sm">{condition}</p>
              </div>
            </div>
            {location && (
              <div className="flex items-center gap-1 mt-2 text-slate-500 text-sm">
                <MapPin className="w-3 h-3" />
                <span>{location}</span>
              </div>
            )}
          </div>

          <div className="text-right">
            <p className="text-slate-500 text-sm">H: {high}° / L: {low}°</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Humidity</p>
              <p className="text-sm font-semibold text-slate-900">{humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Wind</p>
              <p className="text-sm font-semibold text-slate-900">{windSpeed} m/s</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Feels like</p>
              <p className="text-sm font-semibold text-slate-900">{temperature + 2}°C</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
