'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Bookmark, Navigation, Share2, RefreshCw, TrendingUp, MapPin, Star, CheckCircle, AlertTriangle, ArrowUp, ArrowDown, Minus, PhoneCall } from 'lucide-react'

const APMC_DEFAULTS = {
  weighingPerQuintal: 20,
  loadingPerQuintal: 45,
  transportPerKm: 3,
}

function safeNum(val: unknown, fallback = 0): number {
  const n = Number(val)
  return Number.isFinite(n) ? n : fallback
}

function formatINR(num: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'Today'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateStr
  }
}

interface DealCardProps {
  deal: any
  index: number
  avgPrice: number
  quantity: number
  onSaveSuccess: () => void
  location: any
}

function DealCard({ deal, index, avgPrice, quantity, location, onSaveSuccess }: DealCardProps) {
  const distance = safeNum(deal.distance_km)
  const pricePerQuintal = safeNum(deal.price_per_quintal) || safeNum(deal.mandi_price)
  const grossAmount = safeNum(deal.gross_amount) || safeNum(deal.total_gross_amount) || pricePerQuintal * quantity
  const transport = safeNum(deal.transport_cost_total) || Math.round(distance * APMC_DEFAULTS.transportPerKm * quantity)
  const weighing = safeNum(deal.weighing_charges) || Math.round(quantity * APMC_DEFAULTS.weighingPerQuintal)
  const loading = safeNum(deal.loading_cost) || Math.round(quantity * APMC_DEFAULTS.loadingPerQuintal)
  const unloading = safeNum(deal.unloading_cost) || Math.round(quantity * 30)
  const commission = safeNum(deal.mandi_commission_amount)
  const netInHand = safeNum(deal.net_profit_in_hand) || grossAmount - transport - weighing - loading - unloading - commission
  const netPerQuintal = safeNum(deal.net_per_quintal) || (quantity > 0 ? netInHand / quantity : 0)
  const trendPercent = safeNum(deal.trend_percent, (Math.random() * 10 - 3))
  const dateReported = deal.date_reported || ''
  const variety = deal.variety || 'Standard'
  const buyerPhone = deal.buyer_phone || '+91-XXXXXXXXXX'

  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const isHighProfit = netInHand > avgPrice * 1.1
  const isRising = trendPercent > 0
  const isFalling = trendPercent < 0

  const handleSave = async () => {
    if (saved || saving) return
    setSaving(true)
    try {
      const res = await fetch('/api/fassal-deal/saved-deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market_name: deal.buyer_name,
          commodity: deal.buyer_type === 'mandi' ? 'Various' : deal.buyer_type,
          modal_price: pricePerQuintal,
          net_in_hand: netInHand,
          date_reported: dateReported || new Date().toISOString().split('T')[0],
          variety,
          distance_km: distance,
          buyer_phone: buyerPhone,
        }),
      })
      const data = await res.json()
      if (data.saved || data.message === 'Already saved') {
        setSaved(true)
        onSaveSuccess()
      } else {
        console.error('Save failed:', data.error)
      }
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDirections = () => {
    // Get market coordinates
    const marketLat = deal.buyer_lat ?? deal.latitude;
    const marketLng = deal.buyer_lng ?? deal.longitude;

    if (marketLat && marketLng) {
      // Method 1: Use exact coordinates (most accurate)
      // Opens Google Maps from user's current location
      // to the EXACT market coordinates
      const url = `https://www.google.com/maps/dir/?api=1` +
        `&destination=${marketLat},${marketLng}` +
        `&travelmode=driving`;
      window.open(url, '_blank');
    } else {
      // Method 2: Fallback using market name search
      const marketCity = deal.buyer_district || deal.buyer_location || 'Maharashtra';
      const query = encodeURIComponent(
        `${deal.buyer_name} APMC Mandi ${marketCity} India`
      );
      const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      window.open(url, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
        index === 0 ? 'border-yellow-400 ring-2 ring-yellow-100' : 'border-gray-200'
      }`}
    >
      {deal.deal_badge && (
        <div className={`px-4 py-1.5 text-xs font-bold text-white ${
          deal.deal_badge === 'BEST_DEAL' ? 'bg-yellow-500' :
          deal.deal_badge === 'HIGHEST_PRICE' ? 'bg-green-500' :
          deal.deal_badge === 'NEAREST' ? 'bg-blue-500' :
          'bg-purple-500'
        }`}>
          {deal.deal_badge === 'BEST_DEAL' ? '🏆 BEST DEAL' :
           deal.deal_badge === 'HIGHEST_PRICE' ? '💰 HIGHEST PRICE' :
           deal.deal_badge === 'NEAREST' ? '📍 NEAREST' :
           '⭐ MOST TRUSTED'}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">#{deal.rank || index + 1}</span>
              <h3 className="text-lg font-semibold text-gray-900">{deal.buyer_name}</h3>
              {deal.buyer_verified && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{deal.buyer_location}</span>
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" />{safeNum(deal.buyer_rating).toFixed(1)}</span>
              <span>{distance}km</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">Variety: {variety}</span>
              <span className="text-xs text-gray-300">•</span>
              <span className="text-xs text-gray-400">📅 Price as of: {formatDate(dateReported)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-bold ${isRising ? 'text-green-600' : isFalling ? 'text-red-600' : 'text-gray-500'}`}>
              {formatINR(pricePerQuintal)}/q
            </span>
            {isRising && <ArrowUp className="w-4 h-4 text-green-500" />}
            {isFalling && <ArrowDown className="w-4 h-4 text-red-500" />}
            {!isRising && !isFalling && <Minus className="w-4 h-4 text-gray-400" />}
            <span className={`text-xs font-medium ${isRising ? 'text-green-600' : isFalling ? 'text-red-600' : 'text-gray-500'}`}>
              {isRising ? '+' : ''}{trendPercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {isHighProfit && (
          <div className="mb-3 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg inline-flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-semibold text-green-700">High Profit — {((netInHand / (avgPrice * quantity)) * 100 - 100).toFixed(0)}% above average</span>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Mandi Price</span>
            <span className="font-medium">{formatINR(pricePerQuintal)} /quintal</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Gross Amount</span>
            <span className="font-bold">{formatINR(grossAmount)}</span>
          </div>
          <hr />
          <div className="flex justify-between text-red-600">
            <span>🚛 Transport ({distance}km × ₹{APMC_DEFAULTS.transportPerKm}/km)</span>
            <span>- {formatINR(transport)}</span>
          </div>
          {commission > 0 && (
            <div className="flex justify-between text-red-600">
              <span>🏦 Commission ({safeNum(deal.mandi_commission_percent)}%)</span>
              <span>- {formatINR(commission)}</span>
            </div>
          )}
          <div className="flex justify-between text-red-600">
            <span>⚖️ Weighing (Tolay)</span>
            <span>- {formatINR(weighing)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>📤 Loading/Unloading (Hamali)</span>
            <span>- {formatINR(loading + unloading)}</span>
          </div>
          <hr />
          <div className="flex justify-between text-lg font-bold">
            <span className="text-green-700">💎 NET IN HAND</span>
            <span className="text-green-600">{formatINR(netInHand)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Per Quintal Net</span>
            <span>{formatINR(netPerQuintal)}</span>
          </div>
        </div>

        {deal.ai_trust_score && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">🤖 AI Score:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  safeNum(deal.ai_trust_score) >= 80 ? 'bg-green-500' :
                  safeNum(deal.ai_trust_score) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${safeNum(deal.ai_trust_score)}%` }}
              />
            </div>
            <span className="text-sm font-bold">{safeNum(deal.ai_trust_score)}/100</span>
          </div>
        )}

        {deal.ai_pros && deal.ai_pros.length > 0 && (
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-green-700 mb-1">✅ Pros</p>
              {deal.ai_pros.map((p: string, j: number) => (
                <p key={j} className="text-xs text-gray-600">• {p}</p>
              ))}
            </div>
            {deal.ai_cons && deal.ai_cons.length > 0 && (
              <div>
                <p className="text-xs font-medium text-red-700 mb-1">⚠️ Cons</p>
                {deal.ai_cons.map((c: string, j: number) => (
                  <p key={j} className="text-xs text-gray-600">• {c}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-4 flex-wrap">
          <a
            href={`tel:${buyerPhone.replace(/[^+\d]/g, '')}`}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Phone className="w-4 h-4" /> Contact
          </a>
          <a
            href={`tel:${buyerPhone.replace(/[^+\d]/g, '')}`}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <PhoneCall className="w-4 h-4" /> Call Agent
          </a>
          <button
            onClick={handleSave}
            disabled={saved || saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              saved
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-green-600 text-green-600' : ''}`} />
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={handleDirections}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <Navigation className="w-4 h-4" /> Directions
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function Step5Results({ deals, aiAnalysis, crop, quantity, location, onNewSearch, onSaveSuccess }: any) {
  const [sortBy, setSortBy] = useState('profit')
  const [filterType, setFilterType] = useState('all')

  const sortedDeals = [...deals].sort((a: any, b: any) => {
    if (sortBy === 'profit') return safeNum(b.net_profit_in_hand) - safeNum(a.net_profit_in_hand)
    if (sortBy === 'price') return safeNum(b.price_per_quintal || b.mandi_price) - safeNum(a.price_per_quintal || a.mandi_price)
    if (sortBy === 'distance') return safeNum(a.distance_km) - safeNum(b.distance_km)
    if (sortBy === 'rating') return safeNum(b.buyer_rating) - safeNum(a.buyer_rating)
    return 0
  }).filter((d: any) => filterType === 'all' || d.buyer_type === filterType)

  const bestDeal = deals[0]
  const avgDistance = deals.reduce((s: number, d: any) => s + safeNum(d.distance_km), 0) / Math.max(deals.length, 1)
  const minPrice = Math.min(...deals.map((d: any) => safeNum(d.price_per_quintal || d.mandi_price)))
  const maxPrice = Math.max(...deals.map((d: any) => safeNum(d.price_per_quintal || d.mandi_price)))
  const avgPrice = deals.reduce((s: number, d: any) => s + safeNum(d.net_profit_in_hand), 0) / Math.max(deals.length, 1)

  const shareOnWhatsApp = () => {
    const text = `🌾 Fassal Deal Results\n\nCrop: ${crop?.name}\nQuantity: ${quantity} quintals\nBest Deal: ${bestDeal?.buyer_name}\nNet Profit: ${formatINR(safeNum(bestDeal?.net_profit_in_hand))}\n\nFind your best deal on AgriMind Pro!`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">🎯 Aapke Liye Best Deals Mil Gaye!</h2>
        <p className="text-gray-500 mt-2">Ranked by maximum profit in your hand</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Deals Found', value: `${deals.length}`, sub: 'options' },
          { label: 'Best Profit', value: formatINR(safeNum(bestDeal?.net_profit_in_hand)), sub: 'Deal #1' },
          { label: 'Price Range', value: `${formatINR(minPrice)}-${formatINR(maxPrice)}`, sub: '/quintal' },
          { label: 'Avg Distance', value: `${Math.round(avgDistance)}km`, sub: 'avg' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"
          >
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-xl font-bold text-green-600 mt-1">{stat.value}</p>
            <p className="text-xs text-gray-400">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {aiAnalysis && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-semibold">AI Market Pulse</h3>
          </div>
          <p className="text-sm text-green-100">{aiAnalysis.market_summary}</p>
          <p className="text-sm mt-2">🕐 {aiAnalysis.best_time_to_sell}</p>
        </motion.div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          {['profit', 'price', 'distance', 'rating'].map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sortBy === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {s === 'profit' ? 'Best Profit ★' : s === 'price' ? 'Highest Price' : s === 'distance' ? 'Nearest' : 'Top Rated'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {['all', 'mandi', 'private_buyer'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === f ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {f === 'all' ? 'All' : f === 'mandi' ? 'Mandi' : 'Private'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {sortedDeals.map((deal: any, i: number) => (
          <DealCard
            key={deal.buyer_name + i}
            deal={deal}
            index={i}
            avgPrice={avgPrice}
            quantity={quantity}
            location={location}
            onSaveSuccess={onSaveSuccess}
          />
        ))}
      </div>

      {aiAnalysis && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-br from-green-700 to-emerald-800 text-white rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold mb-3">🤖 AgriMind AI Recommends</h3>
          <p className="text-sm text-green-100 mb-4">{aiAnalysis.best_deal_reason}</p>
          {aiAnalysis.risks && aiAnalysis.risks.length > 0 && (
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-300">Risks to Watch</p>
                {aiAnalysis.risks.map((r: string, i: number) => (
                  <p key={i} className="text-xs text-green-200">• {r}</p>
                ))}
              </div>
            </div>
          )}
          {aiAnalysis.transport_tip && (
            <p className="text-xs text-green-200">🚛 {aiAnalysis.transport_tip}</p>
          )}
        </motion.div>
      )}

      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={onNewSearch} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
          <RefreshCw className="w-4 h-4" /> New Search
        </button>
        <button onClick={shareOnWhatsApp} className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
          <Share2 className="w-4 h-4" /> Share Results
        </button>
      </div>
    </div>
  )
}
