'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Loader2 } from 'lucide-react'
import { INDIAN_STATES } from '@/lib/fassal-deal/crop-data'

export default function Step3Location({
  location,
  setLocation,
  maxDistance,
  setMaxDistance,
  hasOwnTransport,
  setHasOwnTransport,
  onNext,
  onBack,
}: any) {
  const [detecting, setDetecting] = useState(false)
  const [manualState, setManualState] = useState('')
  const [manualDistrict, setManualDistrict] = useState('')

  const detectLocation = () => {
    setDetecting(true)
    if (!navigator.geolocation) {
      setDetecting(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
          const data = await res.json()
          setLocation({
            lat: latitude,
            lng: longitude,
            address: data.display_name || '',
            district: data.address?.county || data.address?.district || data.address?.city || '',
            state: data.address?.state || '',
          })
        } catch {
          setLocation({
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            district: '',
            state: '',
          })
        }
        setDetecting(false)
      },
      () => setDetecting(false),
      { enableHighAccuracy: true }
    )
  }

  const setManualLocation = () => {
    setLocation({
      lat: 0,
      lng: 0,
      address: `${manualDistrict}, ${manualState}`,
      district: manualDistrict,
      state: manualState,
    })
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Aap Kahan Se Bech Rahe Ho? 📍</h2>
        <p className="text-gray-500 mt-2">Your location helps us find nearby markets</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Auto Detect */}
          <div className="p-6 bg-green-50 rounded-2xl border border-green-200 text-center">
            <motion.div
              animate={detecting ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: detecting ? Infinity : 0, duration: 1 }}
              className="text-4xl mb-3"
            >
              📍
            </motion.div>
            <button
              onClick={detectLocation}
              disabled={detecting}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {detecting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {detecting ? 'Detecting...' : 'Use My Current Location'}
            </button>
            {location && location.lat !== 0 && (
              <p className="text-sm text-green-700 mt-3">
                ✅ {location.district}, {location.state}
              </p>
            )}
          </div>

          {/* Manual Input */}
          <div>
            <p className="text-sm text-gray-500 mb-3">Or enter manually:</p>
            <div className="space-y-3">
              <select
                value={manualState}
                onChange={(e) => setManualState(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-green-500 outline-none"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input
                type="text"
                value={manualDistrict}
                onChange={(e) => setManualDistrict(e.target.value)}
                placeholder="District"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-green-500 outline-none"
              />
              <button
                onClick={setManualLocation}
                disabled={!manualState || !manualDistrict}
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Set Location
              </button>
            </div>
          </div>

          {/* Search Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Radius: {maxDistance}km
            </label>
            <input
              type="range"
              min={10}
              max={300}
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full accent-green-600"
            />
            <div className="flex gap-2 mt-2">
              {[25, 50, 100, 200].map((d) => (
                <button
                  key={d}
                  onClick={() => setMaxDistance(d)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    maxDistance === d ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {d}km
                </button>
              ))}
            </div>
          </div>

          {/* Transport */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transport Preference</label>
            <div className="space-y-2">
              <button
                onClick={() => setHasOwnTransport(true)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                  hasOwnTransport ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                🚜 I have my own vehicle
              </button>
              <button
                onClick={() => setHasOwnTransport(false)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                  !hasOwnTransport ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                🚛 Need to arrange transport
              </button>
            </div>
          </div>
        </div>

        {/* Map Preview */}
        <div className="bg-gray-100 rounded-2xl h-[400px] flex items-center justify-center">
          {location && location.lat !== 0 ? (
            <div className="text-center">
              <MapPin className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-sm font-medium">{location.district}, {location.state}</p>
              <p className="text-xs text-gray-500 mt-1">Searching within {maxDistance}km radius</p>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm">Set your location to see the map</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button onClick={onBack} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!location || (location.lat === 0 && !location.state)}
          className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🔍 Dhundho Best Deals →
        </button>
      </div>
    </div>
  )
}
