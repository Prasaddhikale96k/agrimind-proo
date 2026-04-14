'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, TrendingUp, MapPin, Package, BarChart3, History, Bookmark, X, Trash2, ExternalLink, RotateCcw, CheckCircle } from 'lucide-react'
import { CROP_OPTIONS } from '@/lib/fassal-deal/crop-data'
import Step1CropSelect from '@/components/fassal-deal/Step1CropSelect'
import Step2Quantity from '@/components/fassal-deal/Step2Quantity'
import Step3Location from '@/components/fassal-deal/Step3Location'
import Step4Scanning from '@/components/fassal-deal/Step4Scanning'
import Step5Results from '@/components/fassal-deal/Step5Results'
import PriceTicker from '@/components/fassal-deal/PriceTicker'
import QuickStats from '@/components/fassal-deal/QuickStats'

export default function FassalDealPage() {
  const [step, setStep] = useState(1)
  const [searchId, setSearchId] = useState<string | null>(null)
  const [deals, setDeals] = useState<any[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [savedDeals, setSavedDeals] = useState<any[]>([])
  const [searchHistory, setSearchHistory] = useState<any[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const [selectedCrop, setSelectedCrop] = useState<any>(null)
  const [quantity, setQuantity] = useState(100)
  const [quantityUnit, setQuantityUnit] = useState<'quintals' | 'kg'>('quintals')
  const [grade, setGrade] = useState<'A' | 'B' | 'C'>('B')
  const [moisture, setMoisture] = useState(14)
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string; district: string; state: string } | null>(null)
  const [maxDistance, setMaxDistance] = useState(100)
  const [hasOwnTransport, setHasOwnTransport] = useState(false)

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchSavedDeals = async () => {
    try {
      const res = await fetch('/api/fassal-deal/saved-deals')
      const data = await res.json()
      if (data.deals) setSavedDeals(data.deals)
    } catch (err) {
      console.error('Failed to fetch saved deals:', err)
    }
  }

  const fetchSearchHistory = async () => {
    try {
      const res = await fetch('/api/fassal-deal/search-history')
      const data = await res.json()
      if (data.history) setSearchHistory(data.history)
    } catch (err) {
      console.error('Failed to fetch history:', err)
    }
  }

  const handleSaveToHistory = async () => {
    if (!selectedCrop || !location) return
    try {
      await fetch('/api/fassal-deal/search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `${selectedCrop.name} - ${location.district || location.state}`,
          crop_name: selectedCrop.name,
          state: location.state,
          district: location.district,
          quantity_quintals: quantityUnit === 'quintals' ? quantity : quantity / 100,
        }),
      })
    } catch (err) {
      console.error('Failed to save history:', err)
    }
  }

  const handleDeleteHistory = async (id: string) => {
    try {
      await fetch(`/api/fassal-deal/search-history?id=${id}`, { method: 'DELETE' })
      setSearchHistory((prev) => prev.filter((h) => h.id !== id))
      showToast('Entry deleted', 'info')
    } catch (err) {
      console.error('Failed to delete history:', err)
    }
  }

  const handleDeleteSaved = async (id: string) => {
    try {
      await fetch(`/api/fassal-deal/saved-deals?id=${id}`, { method: 'DELETE' })
      setSavedDeals((prev) => prev.filter((d) => d.id !== id))
      showToast('Deal removed', 'info')
    } catch (err) {
      console.error('Failed to delete saved deal:', err)
    }
  }

  const handleSearch = async () => {
    if (!selectedCrop || !location) return
    setLoading(true)
    setStep(4)

    await handleSaveToHistory()

    const apiStart = Date.now()
    const minDisplayTime = 2500

    try {
      const res = await fetch('/api/fassal-deal/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName: selectedCrop.name,
          cropVariety: selectedCrop.variety,
          cropGrade: grade,
          quantityKg: quantityUnit === 'kg' ? quantity : quantity * 100,
          quantityQuintals: quantityUnit === 'quintals' ? quantity : quantity / 100,
          moistureContent: moisture,
          farmerLat: location.lat,
          farmerLng: location.lng,
          farmerDistrict: location.district,
          farmerState: location.state,
          maxDistanceKm: maxDistance,
          hasOwnTransport,
        }),
      })

      const data = await res.json()

      const elapsed = Date.now() - apiStart
      if (elapsed < minDisplayTime) {
        await new Promise((r) => setTimeout(r, minDisplayTime - elapsed))
      }

      if (data.deals) {
        setSearchId(data.searchId)
        setDeals(data.deals)
        setAiAnalysis(data.aiAnalysis)
        setStep(5)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetSearch = () => {
    setStep(1)
    setSearchId(null)
    setDeals([])
    setAiAnalysis(null)
    setSelectedCrop(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className={`fixed top-4 right-4 z-[9999] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🌾</div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Fassal Deal</h1>
                <p className="text-green-100 text-sm mt-0.5">Beche Sahi Daam Par • Find Best Market for Your Crop</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowHistory(true); fetchSearchHistory() }}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors text-sm"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Past Searches</span>
              </button>
              <button
                onClick={() => { setShowSaved(true); fetchSavedDeals() }}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors text-sm"
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">Saved Deals</span>
              </button>
              {step > 1 && step < 4 && (
                <button
                  onClick={resetSearch}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors text-sm"
                >
                  New Search
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Price Ticker - moved up, thinner */}
        <PriceTicker />
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 -mt-4">
        <QuickStats />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        {step < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      s < step
                        ? 'bg-green-600 text-white'
                        : s === step
                        ? 'bg-green-600 text-white ring-4 ring-green-200'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {s < step ? '✓' : s}
                  </div>
                  {s < 5 && (
                    <div className={`w-12 sm:w-20 h-1 mx-1 rounded ${s < step ? 'bg-green-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-green-600 h-2 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${(step / 5) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Wizard Steps */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
            >
              <Step1CropSelect
                selectedCrop={selectedCrop}
                onSelect={setSelectedCrop}
                onNext={() => setStep(2)}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
            >
              <Step2Quantity
                quantity={quantity}
                setQuantity={setQuantity}
                quantityUnit={quantityUnit}
                setQuantityUnit={setQuantityUnit}
                grade={grade}
                setGrade={setGrade}
                moisture={moisture}
                setMoisture={setMoisture}
                selectedCrop={selectedCrop}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
            >
              <Step3Location
                location={location}
                setLocation={setLocation}
                maxDistance={maxDistance}
                setMaxDistance={setMaxDistance}
                hasOwnTransport={hasOwnTransport}
                setHasOwnTransport={setHasOwnTransport}
                onNext={handleSearch}
                onBack={() => setStep(2)}
              />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Step4Scanning />
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <Step5Results
                deals={deals}
                aiAnalysis={aiAnalysis}
                crop={selectedCrop}
                quantity={quantityUnit === 'quintals' ? quantity : quantity / 100}
                location={location}
                onNewSearch={resetSearch}
                onSaveSuccess={() => showToast('Deal saved successfully!', 'success')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Past Searches Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">Past Searches</h3>
                </div>
                <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[60vh] p-4">
                {searchHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No past searches yet</p>
                    <p className="text-xs mt-1">Your searches will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.query || `${item.crop_name} - ${item.district || item.state}`}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            {item.quantity_quintals > 0 && ` • ${item.quantity_quintals}q`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteHistory(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Deals Modal */}
      <AnimatePresence>
        {showSaved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSaved(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">Saved Deals</h3>
                  {savedDeals.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{savedDeals.length}</span>
                  )}
                </div>
                <button onClick={() => setShowSaved(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[60vh] p-4">
                {savedDeals.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No saved deals yet</p>
                    <p className="text-xs mt-1">Tap the bookmark icon on any deal to save it</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900">{deal.market_name}</p>
                              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{deal.variety || 'Standard'}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{deal.commodity}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="font-medium text-green-700">₹{deal.modal_price}/q</span>
                              <span>Net: ₹{deal.net_in_hand}</span>
                              <span>{deal.distance_km}km</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              📅 {deal.date_reported ? new Date(deal.date_reported).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                            </p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {deal.buyer_phone && (
                              <a
                                href={`tel:${deal.buyer_phone.replace(/[^+\d]/g, '')}`}
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteSaved(deal.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
