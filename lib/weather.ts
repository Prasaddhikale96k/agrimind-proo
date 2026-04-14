'use client'

import { useState, useEffect } from 'react'

const API_KEY = 'df1a9b4cb1050c130817ebc84aa2e2aa'
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

export interface WeatherResponse {
  temp: number
  humidity: number
  wind_speed: number
  condition: string
  high: number
  low: number
  description: string
  icon: string
}

export interface ForecastDay {
  date: string
  temp: number
  high: number
  low: number
  condition: string
  humidity: number
  icon: string
}

function parseLocation(location: string): { lat?: number; lon?: number; city?: string } {
  const indiaCities: Record<string, [number, number]> = {
    'nashik': [20.0114, 73.7909],
    'mumbai': [19.0760, 72.8777],
    'pune': [18.5204, 73.8567],
    'delhi': [28.7041, 77.1025],
    'bangalore': [12.9716, 77.5946],
    'hyderabad': [17.3850, 78.4867],
    'chennai': [13.0827, 80.2707],
    'kolkata': [22.5726, 88.3639],
    'jaipur': [26.9124, 75.7873],
    'ahmedabad': [23.0225, 72.5714],
    'lucknow': [26.8467, 80.9462],
    'chandigarh': [30.7333, 76.7794],
    'bhopal': [23.2599, 77.4126],
    'indore': [22.7196, 75.8575],
    'surat': [21.1702, 72.8311],
    'vadodara': [22.3072, 73.1812],
    'nagpur': [21.1458, 79.0882],
    'maharashtra': [19.7515, 75.7139],
  }

  const loc = location.toLowerCase().trim()
  
  for (const [city, coords] of Object.entries(indiaCities)) {
    if (loc.includes(city)) {
      return { lat: coords[0], lon: coords[1], city: city }
    }
  }
  
  return { city: location }
}

export async function fetchCurrentWeather(location: string): Promise<WeatherResponse | null> {
  try {
    const parsed = parseLocation(location)
    let url: string

    if (parsed.lat && parsed.lon) {
      url = `${BASE_URL}/weather?lat=${parsed.lat}&lon=${parsed.lon}&appid=${API_KEY}&units=metric`
    } else {
      url = `${BASE_URL}/weather?q=${encodeURIComponent(parsed.city || location)},India&appid=${API_KEY}&units=metric`
    }

    const response = await fetch(url)
    if (!response.ok) {
      console.error('Weather API error:', response.status)
      return null
    }

    const data = await response.json()
    
    return {
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      wind_speed: Math.round(data.wind.speed * 10) / 10,
      condition: data.weather[0].main,
      high: Math.round(data.main.temp_max),
      low: Math.round(data.main.temp_min),
      description: data.weather[0].description,
      icon: data.weather[0].icon
    }
  } catch (error) {
    console.error('Error fetching weather:', error)
    return null
  }
}

export async function fetchForecast(location: string, days: number = 5): Promise<ForecastDay[]> {
  try {
    const parsed = parseLocation(location)
    let url: string

    if (parsed.lat && parsed.lon) {
      url = `${BASE_URL}/forecast?lat=${parsed.lat}&lon=${parsed.lon}&appid=${API_KEY}&units=metric&cnt=${days * 8}`
    } else {
      url = `${BASE_URL}/forecast?q=${encodeURIComponent(parsed.city || location)},India&appid=${API_KEY}&units=metric&cnt=${days * 8}`
    }

    const response = await fetch(url)
    if (!response.ok) {
      return []
    }

    const data = await response.json()
    const dailyMap = new Map<string, any[]>()

    data.list.forEach((item: any) => {
      const date = item.dt_txt.split(' ')[0]
      if (!dailyMap.has(date)) {
        dailyMap.set(date, [])
      }
      dailyMap.get(date)!.push(item)
    })

    const forecasts: ForecastDay[] = []
    dailyMap.forEach((items, date) => {
      const temps = items.map((i) => i.main.temp)
      const high = Math.max(...temps)
      const low = Math.min(...temps)
      const midIndex = Math.floor(items.length / 2)
      
      forecasts.push({
        date,
        temp: Math.round((temps.reduce((a, b) => a + b, 0) / temps.length)),
        high: Math.round(high),
        low: Math.round(low),
        condition: items[midIndex].weather[0].main,
        humidity: items[midIndex].main.humidity,
        icon: items[midIndex].weather[0].icon
      })
    })

    return forecasts.slice(0, days)
  } catch (error) {
    console.error('Error fetching forecast:', error)
    return []
  }
}

export function useWeather(location: string | null) {
  const [weather, setWeather] = useState<WeatherResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadWeather() {
      if (!location) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await fetchCurrentWeather(location)
        setWeather(data)
      } catch (err) {
        setError('Failed to load weather')
      } finally {
        setLoading(false)
      }
    }

    loadWeather()
  }, [location])

  return { weather, loading, error }
}

export function useForecast(location: string | null, days: number = 5) {
  const [forecast, setForecast] = useState<ForecastDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadForecast() {
      if (!location) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const data = await fetchForecast(location, days)
        setForecast(data)
      } catch (err) {
        console.error('Failed to load forecast:', err)
      } finally {
        setLoading(false)
      }
    }

    loadForecast()
  }, [location, days])

  return { forecast, loading }
}
