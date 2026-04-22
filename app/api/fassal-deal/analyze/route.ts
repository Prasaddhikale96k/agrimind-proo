import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { haversineDistance, estimateTravelHours } from '@/lib/fassal-deal/haversine'
import { calculateDeal } from '@/lib/fassal-deal/transport-calculator'
import { fetchMandiPricesFromAgmarknet } from '@/lib/fassal-deal/agmarknet-api'

const MANDI_DB: Record<string, Array<{ name: string; lat: number; lng: number; state: string; district: string; price: number; rating: number }>> = {
  tomato: [
    { name: 'Nashik APMC', lat: 19.9975, lng: 73.7898, state: 'Maharashtra', district: 'Nashik', price: 1450, rating: 4.2 },
    { name: 'Pune APMC', lat: 18.5204, lng: 73.8567, state: 'Maharashtra', district: 'Pune', price: 1200, rating: 4.0 },
    { name: 'Mumbai APMC', lat: 19.076, lng: 72.8777, state: 'Maharashtra', district: 'Mumbai', price: 1800, rating: 4.5 },
    { name: 'Lasalgaon Mandi', lat: 20.0167, lng: 73.9833, state: 'Maharashtra', district: 'Nashik', price: 1350, rating: 3.8 },
    { name: 'Nagpur APMC', lat: 21.1458, lng: 79.0882, state: 'Maharashtra', district: 'Nagpur', price: 1400, rating: 4.3 },
    { name: 'Delhi Azadpur', lat: 28.7233, lng: 77.1824, state: 'Delhi', district: 'Delhi', price: 1900, rating: 4.6 },
    { name: 'Bangalore APMC', lat: 12.9716, lng: 77.5946, state: 'Karnataka', district: 'Bangalore', price: 1500, rating: 4.3 },
    { name: 'Ahmedabad APMC', lat: 23.0225, lng: 72.5714, state: 'Gujarat', district: 'Ahmedabad', price: 1350, rating: 4.2 },
    { name: 'Indore Mandi', lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh', district: 'Indore', price: 1250, rating: 4.1 },
    { name: 'Jaipur APMC', lat: 26.9124, lng: 75.7873, state: 'Rajasthan', district: 'Jaipur', price: 1300, rating: 4.0 },
  ],
  onion: [
    { name: 'Lasalgaon Mandi', lat: 20.0167, lng: 73.9833, state: 'Maharashtra', district: 'Nashik', price: 800, rating: 4.5 },
    { name: 'Nashik APMC', lat: 19.9975, lng: 73.7898, state: 'Maharashtra', district: 'Nashik', price: 850, rating: 4.3 },
    { name: 'Pune APMC', lat: 18.5204, lng: 73.8567, state: 'Maharashtra', district: 'Pune', price: 750, rating: 4.0 },
    { name: 'Mumbai APMC', lat: 19.076, lng: 72.8777, state: 'Maharashtra', district: 'Mumbai', price: 950, rating: 4.4 },
    { name: 'Delhi Azadpur', lat: 28.7233, lng: 77.1824, state: 'Delhi', district: 'Delhi', price: 1100, rating: 4.6 },
    { name: 'Indore Mandi', lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh', district: 'Indore', price: 700, rating: 3.9 },
  ],
  wheat: [
    { name: 'Amritsar Mandi', lat: 31.634, lng: 74.8723, state: 'Punjab', district: 'Amritsar', price: 2150, rating: 4.5 },
    { name: 'Ludhiana APMC', lat: 30.901, lng: 75.8573, state: 'Punjab', district: 'Ludhiana', price: 2100, rating: 4.3 },
    { name: 'Delhi Azadpur', lat: 28.7233, lng: 77.1824, state: 'Delhi', district: 'Delhi', price: 2200, rating: 4.6 },
    { name: 'Nashik APMC', lat: 19.9975, lng: 73.7898, state: 'Maharashtra', district: 'Nashik', price: 2250, rating: 4.2 },
    { name: 'Indore Mandi', lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh', district: 'Indore', price: 2100, rating: 4.1 },
  ],
  grapes: [
    { name: 'Nashik APMC', lat: 19.9975, lng: 73.7898, state: 'Maharashtra', district: 'Nashik', price: 3500, rating: 4.5 },
    { name: 'Sangli APMC', lat: 16.8524, lng: 74.5815, state: 'Maharashtra', district: 'Sangli', price: 3200, rating: 4.2 },
    { name: 'Pune APMC', lat: 18.5204, lng: 73.8567, state: 'Maharashtra', district: 'Pune', price: 3800, rating: 4.4 },
    { name: 'Mumbai APMC', lat: 19.076, lng: 72.8777, state: 'Maharashtra', district: 'Mumbai', price: 4200, rating: 4.6 },
    { name: 'Bangalore APMC', lat: 12.9716, lng: 77.5946, state: 'Karnataka', district: 'Bangalore', price: 3600, rating: 4.3 },
  ],
}

const PRIVATE_BUYERS = [
  { name: 'FreshMart Export House', type: 'export_house', premium: 1.08, rating: 4.8, verified: true, distance: 23, phone: '+91-9876543210' },
  { name: 'GreenHarvest FPO', type: 'fpo', premium: 1.05, rating: 4.5, verified: true, distance: 35, phone: '+91-9876543211' },
  { name: 'AgriDirect Private Ltd', type: 'private_buyer', premium: 1.03, rating: 4.3, verified: true, distance: 15, phone: '+91-9876543212' },
  { name: 'Maharashtra Cold Storage', type: 'cold_storage', premium: 1.02, rating: 4.1, verified: false, distance: 45, phone: '+91-9876543213' },
  { name: 'Kisan Mill Processing', type: 'mill', premium: 1.0, rating: 4.0, verified: true, distance: 60, phone: '+91-9876543214' },
]

const KNOWN_COORDS: Record<string, { lat: number; lng: number; placeId?: string }> = {
  kalyan: { lat: 19.24, lng: 73.13, placeId: 'ChIJgVl9W2C75zsROM0D_D78tM8' },
  nashik: { lat: 19.9975, lng: 73.7898 }, pune: { lat: 18.5204, lng: 73.8567 },
  mumbai: { lat: 19.076, lng: 72.8777 }, delhi: { lat: 28.7233, lng: 77.1824 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 }, bangalore: { lat: 12.9716, lng: 77.5946 },
  indore: { lat: 22.7196, lng: 75.8577 }, jaipur: { lat: 26.9124, lng: 75.7873 },
  amritsar: { lat: 31.634, lng: 74.8723 }, lucknow: { lat: 26.8467, lng: 80.9462 },
  nagpur: { lat: 21.1458, lng: 79.0882 }, lasalgaon: { lat: 20.1167, lng: 74.0833 },
  sangli: { lat: 16.8524, lng: 74.5815 }, kolhapur: { lat: 16.705, lng: 74.2433 },
  solapur: { lat: 17.6868, lng: 75.9064 }, aurangabad: { lat: 19.8762, lng: 75.3433 },
  jalgaon: { lat: 21.0077, lng: 75.5626 }, ahmednagar: { lat: 19.0948, lng: 74.748 },
  satara: { lat: 17.6805, lng: 74.0183 }, ludhiana: { lat: 30.901, lng: 75.8573 },
  bhopal: { lat: 23.2599, lng: 77.4126 }, surat: { lat: 21.1702, lng: 72.8311 },
  kolkata: { lat: 22.5726, lng: 88.3639 }, patna: { lat: 25.5941, lng: 85.1376 },
  agra: { lat: 27.1767, lng: 78.0081 }, jodhpur: { lat: 26.2389, lng: 73.0243 },
  raipur: { lat: 21.2514, lng: 81.6296 }, coimbatore: { lat: 11.0168, lng: 76.9558 },
  chennai: { lat: 13.0827, lng: 80.2707 }, kochi: { lat: 9.9312, lng: 76.2673 },
  guntur: { lat: 16.3067, lng: 80.4365 }, hubli: { lat: 15.3647, lng: 75.124 },
  dhule: { lat: 20.9042, lng: 74.7749 }, nanded: { lat: 19.1383, lng: 77.321 },
  akola: { lat: 20.7002, lng: 77.0082 }, amravati: { lat: 20.9374, lng: 77.7796 },
  wardha: { lat: 20.7453, lng: 78.6022 }, chandrapur: { lat: 19.9615, lng: 79.2961 },
  raigad: { lat: 18.5074, lng: 73.056 }, khed: { lat: 19.1833, lng: 73.8167 },
  shrirampur: { lat: 19.6333, lng: 74.4 }, vaduj: { lat: 17.5167, lng: 74.0667 },
  vashi: { lat: 19.0728, lng: 72.9969 }, kamthi: { lat: 21.2333, lng: 79.1833 },
  amrawati: { lat: 20.9374, lng: 77.7796 },
  // Maharashtra APMC Markets - exact coordinates from prompt
  dindori: { lat: 20.2167, lng: 73.8333 },
  nashik: { lat: 19.9975, lng: 73.7898 },
  lasalgaon: { lat: 20.1167, lng: 74.0833 },
  niphad: { lat: 20.0833, lng: 74.1167 },
  'pimpalgaon baswant': { lat: 20.0833, lng: 74.0500 },
  pimpalgaon: { lat: 20.0833, lng: 74.0500 },
  sinnar: { lat: 19.8478, lng: 74.0022 },
  trimbakeshwar: { lat: 19.9333, lng: 73.5333 },
  igatpuri: { lat: 19.6939, lng: 73.5603 },
  chandwad: { lat: 20.3392, lng: 74.2394 },
  malegaon: { lat: 20.5579, lng: 74.5089 },
  yeola: { lat: 20.0456, lng: 74.4892 },
  satana: { lat: 20.5961, lng: 74.2092 },
  kalwan: { lat: 20.5000, lng: 73.8333 },
  surgana: { lat: 20.5667, lng: 73.6167 },
  deola: { lat: 20.4167, lng: 74.2333 },
  
  // Far markets
  pune: { lat: 18.5204, lng: 73.8567 },
  'pune(khadiki)': { lat: 18.5667, lng: 73.9000 },
  satara: { lat: 17.6805, lng: 74.0183 },
  karad: { lat: 17.2880, lng: 74.1836 },
  solapur: { lat: 17.6868, lng: 75.9064 },
  kolhapur: { lat: 16.7050, lng: 74.2433 },
  baramati: { lat: 18.1518, lng: 74.5815 },

  // Other specific
  hingna: { lat: 21.0069, lng: 78.9710 }, nandurbar: { lat: 21.5374, lng: 74.2424 },
  gondia: { lat: 21.6914, lng: 80.2185 }, gadchiroli: { lat: 19.7102, lng: 80.2245 },
  Washim: { lat: 20.1219, lng: 77.0615 },
  'nashik apmc': { lat: 19.9975, lng: 73.7898 }, 'pune apmc': { lat: 18.5204, lng: 73.8567 },
  'nagpur apmc': { lat: 21.1458, lng: 79.0882 }, 'vashi apmc': { lat: 19.0728, lng: 72.9969 },
  'nashik main': { lat: 19.9975, lng: 73.7898 }
}

function estimateTransportCost(distanceKm: number, quantityQuintals: number): number {
  if (distanceKm <= 0) return 0
  return Math.round(distanceKm * 3 * quantityQuintals)
}

function estimateWeighing(quantityQuintals: number): number {
  return Math.round(quantityQuintals * 20)
}

function estimateLoading(quantityQuintals: number): number {
  return Math.round(quantityQuintals * 45)
}

function estimateUnloading(quantityQuintals: number): number {
  return Math.round(quantityQuintals * 30)
}

function parseDateReported(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0]
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const [d, m, y] = parts
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return dateStr
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      cropName, cropVariety, cropGrade, quantityKg, quantityQuintals,
      moistureContent, farmerLat, farmerLng, farmerDistrict, farmerState,
      maxDistanceKm, hasOwnTransport,
    } = body

    if (!cropName || !quantityQuintals || !farmerLat || !farmerLng) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const maxDist = maxDistanceKm || 100
    const gradeMultiplier = cropGrade === 'A' ? 1.1 : cropGrade === 'C' ? 0.85 : 1
    const cropKey = cropName.toLowerCase()

    console.log('[analyze] Fetching mandi prices...')
    let mandiData = await fetchMandiPricesFromAgmarknet(cropName, farmerState, farmerDistrict)
    console.log(`[analyze] Got ${mandiData.length} mandi records`)

    const deals: any[] = []

    if (mandiData.length > 0) {
      for (const m of mandiData) {
        const key = m.market.toLowerCase().replace(/\s*(mandi|apmc|market|fruit.*veg.*market)\s*/g, '').replace(/[()]/g, '').trim()
        
        // First try exact match, then partial match
        let coordsEntry = Object.entries(KNOWN_COORDS).find(([k]) => key === k);
        if (!coordsEntry) {
          coordsEntry = Object.entries(KNOWN_COORDS).find(([k]) => key.includes(k) || k.includes(key));
        }
        
        // Use known coordinates or generate valid coordinates near farmer's location (NOT random)
        let lat: number, lng: number;
        if (coordsEntry?.[1]) {
          lat = coordsEntry[1].lat;
          lng = coordsEntry[1].lng;
          console.log(`[analyze] Found coordinates for "${m.market}":`, lat, lng);
        } else {
          // Fallback: use farmer's location if no coordinates found
          lat = farmerLat;
          lng = farmerLng;
          console.log(`[analyze] No coordinates for "${m.market}" - using farmer location`);
        }
        const placeId = coordsEntry?.[1].placeId || undefined;

        // If coordinates were found from KNOWN_COORDS, use them. Otherwise, calculate distance as 9999 to filter out unknown coords
        // rather than incorrectly returning distance 0km
        const dist = (lat !== farmerLat || lng !== farmerLng) ? haversineDistance(farmerLat, farmerLng, lat, lng) : 9999
        if (dist > maxDist) continue

        const mandiPrice = Math.round(m.modalPrice * gradeMultiplier)
        const transport = estimateTransportCost(dist, quantityQuintals)
        const weighing = estimateWeighing(quantityQuintals)
        const loading = estimateLoading(quantityQuintals)
        const unloading = estimateUnloading(quantityQuintals)
        const commission = Math.round(mandiPrice * quantityQuintals * 0.02)
        const grossAmount = mandiPrice * quantityQuintals
        const totalDeductions = transport + weighing + loading + unloading + commission
        const netProfitInHand = grossAmount - totalDeductions

        deals.push({
          buyer_type: 'mandi',
          buyer_name: m.market,
          buyer_location: `${m.market}, ${farmerState}`,
          buyer_lat: lat, buyer_lng: lng, buyer_place_id: placeId,
          buyer_district: farmerDistrict,
          buyer_rating: 3.5 + Math.random() * 1.3,
          buyer_verified: true,
          buyer_phone: '+91-XXXXXXXXXX',
          distance_km: Math.round(dist * 100) / 100,
          estimated_travel_hours: estimateTravelHours(dist),
          road_quality: dist > 50 ? 'good' : 'average',
          price_per_quintal: mandiPrice,
          price_per_kg: mandiPrice / 100,
          mandi_price: mandiPrice,
          gross_amount: grossAmount,
          transport_cost_total: transport,
          weighing_charges: weighing,
          loading_cost: loading,
          unloading_cost: unloading,
          mandi_commission_percent: 2.0,
          mandi_commission_amount: commission,
          total_deductions: totalDeductions,
          net_profit_in_hand: netProfitInHand,
          net_per_quintal: Math.round(netProfitInHand / quantityQuintals),
          date_reported: parseDateReported(m.dateReported || m.date),
          variety: m.variety || 'Standard',
          trend_percent: Math.round((Math.random() * 10 - 3) * 10) / 10,
          payment_terms: 'immediate',
          payment_method: 'cash,bank_transfer,upi',
          min_quantity_quintal: 1,
          max_quantity_quintal: 1000,
          accepts_quantity: quantityQuintals <= 1000,
        })
      }
    }

    if (deals.length === 0) {
      const mandiList = MANDI_DB[cropKey] || MANDI_DB['tomato']
      const today = new Date().toISOString().split('T')[0]
      for (const m of mandiList) {
        const dist = haversineDistance(farmerLat, farmerLng, m.lat, m.lng)
        if (dist > maxDist) continue
        const mandiPrice = Math.round(m.price * gradeMultiplier * (0.95 + Math.random() * 0.1))
        const transport = estimateTransportCost(dist, quantityQuintals)
        const weighing = estimateWeighing(quantityQuintals)
        const loading = estimateLoading(quantityQuintals)
        const unloading = estimateUnloading(quantityQuintals)
        const commission = Math.round(mandiPrice * quantityQuintals * 0.02)
        const grossAmount = mandiPrice * quantityQuintals
        const totalDeductions = transport + weighing + loading + unloading + commission
        const netProfitInHand = grossAmount - totalDeductions

        deals.push({
          buyer_type: 'mandi', buyer_name: m.name,
          buyer_location: `${m.district}, ${m.state}`,
          buyer_lat: m.lat, buyer_lng: m.lng, buyer_place_id: undefined,
          buyer_district: m.district, buyer_rating: m.rating,
          buyer_verified: true, buyer_phone: '+91-XXXXXXXXXX',
          distance_km: Math.round(dist * 100) / 100,
          estimated_travel_hours: estimateTravelHours(dist),
          road_quality: dist > 50 ? 'good' : 'average',
          price_per_quintal: mandiPrice, price_per_kg: mandiPrice / 100,
          mandi_price: mandiPrice,
          gross_amount: grossAmount,
          transport_cost_total: transport,
          weighing_charges: weighing,
          loading_cost: loading,
          unloading_cost: unloading,
          mandi_commission_percent: 2.0,
          mandi_commission_amount: commission,
          total_deductions: totalDeductions,
          net_profit_in_hand: netProfitInHand,
          net_per_quintal: Math.round(netProfitInHand / quantityQuintals),
          date_reported: today,
          variety: 'Standard',
          trend_percent: Math.round((Math.random() * 10 - 3) * 10) / 10,
          payment_terms: 'immediate',
          payment_method: 'cash,bank_transfer,upi',
          min_quantity_quintal: 1, max_quantity_quintal: 1000,
          accepts_quantity: quantityQuintals <= 1000,
        })
      }
    }

    const avgPrice = deals.length > 0 ? deals.reduce((s, d) => s + d.price_per_quintal, 0) / deals.length : 1200
    const today = new Date().toISOString().split('T')[0]
    for (const buyer of PRIVATE_BUYERS) {
      if (buyer.distance > maxDist) continue;
      const price = Math.round(avgPrice * buyer.premium * gradeMultiplier)
      const transport = estimateTransportCost(buyer.distance, quantityQuintals)
      const weighing = estimateWeighing(quantityQuintals)
      const loading = estimateLoading(quantityQuintals)
      const unloading = estimateUnloading(quantityQuintals)
      const grossAmount = price * quantityQuintals
      const totalDeductions = transport + weighing + loading + unloading
      const netProfitInHand = grossAmount - totalDeductions

      deals.push({
        buyer_type: buyer.type,
        buyer_name: buyer.name,
        buyer_location: `${farmerDistrict}, ${farmerState}`,
        buyer_lat: farmerLat + (Math.random() - 0.5) * 0.5,
        buyer_lng: farmerLng + (Math.random() - 0.5) * 0.5,
        buyer_place_id: undefined,
        buyer_district: farmerDistrict,
        buyer_rating: buyer.rating,
        buyer_verified: buyer.verified,
        buyer_phone: buyer.phone,
        distance_km: buyer.distance,
        estimated_travel_hours: estimateTravelHours(buyer.distance),
        road_quality: 'good',
        price_per_quintal: price,
        price_per_kg: price / 100,
        mandi_price: price,
        gross_amount: grossAmount,
        transport_cost_total: transport,
        weighing_charges: weighing,
        loading_cost: loading,
        unloading_cost: unloading,
        mandi_commission_percent: 0,
        mandi_commission_amount: 0,
        total_deductions: totalDeductions,
        net_profit_in_hand: netProfitInHand,
        net_per_quintal: Math.round(netProfitInHand / quantityQuintals),
        date_reported: today,
        variety: 'Standard',
        trend_percent: Math.round((Math.random() * 10 - 3) * 10) / 10,
        payment_terms: buyer.type === 'export_house' ? '2days' : 'immediate',
        payment_method: 'bank_transfer,upi',
        min_quantity_quintal: 10,
        max_quantity_quintal: 2000,
        accepts_quantity: quantityQuintals >= 10,
      })
    }

    deals.sort((a, b) => b.net_profit_in_hand - a.net_profit_in_hand)
    deals.forEach((d, i) => { d.rank = i + 1 })

    const avgNetProfit = deals.length > 0 ? deals.reduce((s: number, d: any) => s + d.net_profit_in_hand, 0) / deals.length : 0

    if (deals.length > 0) {
      deals[0].deal_badge = 'BEST_DEAL'
      const highest = [...deals].sort((a, b) => b.price_per_quintal - a.price_per_quintal)[0]
      if (highest && highest !== deals[0]) highest.deal_badge = 'HIGHEST_PRICE'
      const nearest = [...deals].sort((a, b) => a.distance_km - b.distance_km)[0]
      if (nearest && nearest !== deals[0]) nearest.deal_badge = 'NEAREST'
    }

    let aiAnalysis = {
      best_deal: deals[0]?.buyer_name || '',
      best_deal_reason: `Maximum profit of Rs ${deals[0]?.net_profit_in_hand?.toLocaleString('en-IN') || 0} in hand after all deductions.`,
      price_trend: 'stable' as const,
      best_time_to_sell: 'Current prices are fair. Sell within the week.',
      market_summary: `${cropName} market analysis for ${farmerDistrict}. ${deals.length} options found.`,
      risks: ['Weather may affect transport', 'Market arrivals could impact prices'],
      transport_tip: `For this quantity, hiring a truck is cost-effective.`,
    }

    const searchId = `search_${Date.now()}`

    setImmediate(async () => {
      try {
        const { data: search } = await supabaseAdmin.from('fassal_deal_searches').insert({
          crop_name: cropName, crop_variety: cropVariety, crop_quality: cropGrade,
          quantity_kg: quantityKg, quantity_quintals: quantityQuintals,
          moisture_content: moistureContent || 14,
          farmer_lat: farmerLat, farmer_lng: farmerLng,
          farmer_district: farmerDistrict, farmer_state: farmerState,
          max_distance_km: maxDist, search_radius_km: maxDist,
          has_own_transport: hasOwnTransport, search_status: 'completed',
          deals_found: deals.length,
          best_deal_profit: deals[0]?.net_profit_in_hand || 0,
          ai_market_summary: aiAnalysis.market_summary,
          ai_best_time_to_sell: aiAnalysis.best_time_to_sell,
          ai_price_trend: aiAnalysis.price_trend,
          completed_at: new Date().toISOString(),
        }).select().single()

        if (search && deals.length > 0) {
          await supabaseAdmin.from('fassal_deal_results').insert(
            deals.slice(0, 10).map((d: any) => ({ search_id: search.id, ...d, ai_recommendation: aiAnalysis.best_deal_reason }))
          )
        }
      } catch (dbErr) {
        console.warn('[analyze] Background DB save failed:', dbErr)
      }
    })

    console.log(`[analyze] Returning ${deals.length} deals`)
    return NextResponse.json({ searchId, deals, aiAnalysis })
  } catch (error: any) {
    console.error('Fassal Deal Error:', error)
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 })
  }
}
