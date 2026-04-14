import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    const farms = await supabaseAdmin.from('farms').select('id')

    if (!farms.data || farms.data.length === 0) {
      return NextResponse.json({ error: 'No farms found' }, { status: 404 })
    }

    const results = []

    for (const farm of farms.data) {
      const hour = new Date().getHours()
      const baseTemp = 25 + 10 * Math.sin((hour - 6) * Math.PI / 12)
      const humidity = 60 + 20 * Math.cos((hour - 14) * Math.PI / 12)
      const windSpeed = 2 + 3 * Math.random()
      const conditions = ['sunny', 'cloudy', 'rainy', 'windy']
      const condition = conditions[Math.floor(Math.random() * (hour > 10 && hour < 16 ? 2 : 4))]

      const { data: soilData } = await supabaseAdmin
        .from('soil_data')
        .select('moisture_percent')
        .eq('farm_id', farm.id)
        .order('recorded_at', { ascending: false })
        .limit(1)

      const currentMoisture = soilData?.[0]?.moisture_percent || 50
      const newMoisture = Math.max(10, currentMoisture - (2 + Math.random() * 3) + (condition === 'rainy' ? 15 : 0))

      const soilInsert = {
        farm_id: farm.id,
        moisture_percent: parseFloat(newMoisture.toFixed(2)),
        ph_level: parseFloat((6.5 + (Math.random() - 0.5) * 0.6).toFixed(2)),
        nitrogen_ppm: parseFloat((40 + Math.random() * 20).toFixed(2)),
        phosphorus_ppm: parseFloat((25 + Math.random() * 15).toFixed(2)),
        potassium_ppm: parseFloat((20 + Math.random() * 15).toFixed(2)),
        organic_matter_percent: parseFloat((2 + Math.random() * 3).toFixed(2)),
        temperature_celsius: parseFloat(baseTemp.toFixed(2)),
        salinity_ds_per_m: parseFloat((0.5 + Math.random() * 1.5).toFixed(3)),
        data_source: 'simulated',
      }

      const weatherInsert = {
        farm_id: farm.id,
        temperature_celsius: parseFloat(baseTemp.toFixed(2)),
        humidity_percent: parseFloat(humidity.toFixed(2)),
        wind_speed_mps: parseFloat(windSpeed.toFixed(2)),
        wind_direction: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        rainfall_mm: condition === 'rainy' ? parseFloat((5 + Math.random() * 20).toFixed(2)) : 0,
        uv_index: parseFloat((3 + Math.random() * 8).toFixed(1)),
        sunlight_hours: parseFloat((6 + Math.random() * 6).toFixed(1)),
        weather_condition: condition,
        forecast_rain_probability: condition === 'rainy' ? 70 + Math.floor(Math.random() * 30) : Math.floor(Math.random() * 30),
        high_temp: parseFloat((baseTemp + 3).toFixed(2)),
        low_temp: parseFloat((baseTemp - 8).toFixed(2)),
      }

      const [soilRes, weatherRes] = await Promise.all([
        supabaseAdmin.from('soil_data').insert(soilInsert),
        supabaseAdmin.from('weather_data').insert(weatherInsert),
      ])

      if (soilRes.error) console.error('Soil simulation error:', soilRes.error)
      if (weatherRes.error) console.error('Weather simulation error:', weatherRes.error)

      results.push({ farm_id: farm.id, soil: soilRes.data, weather: weatherRes.data })
    }

    return NextResponse.json({ success: true, message: 'Simulation complete', results })
  } catch (error) {
    console.error('Simulation Error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
