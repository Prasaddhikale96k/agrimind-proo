import { GoogleGenerativeAI } from '@google/generative-ai'

interface DealOption {
  buyer_name: string
  buyer_type: string
  distance_km: number
  price_per_quintal: number
  transport_cost_total: number
  total_deductions: number
  net_profit_in_hand: number
  buyer_rating: number
  buyer_verified: boolean
  payment_terms: string
}

interface AIAnalysisResult {
  deals: Array<{
    trust_score: number
    pros: string[]
    cons: string[]
  }>
  best_deal: string
  best_deal_reason: string
  price_trend: 'rising' | 'falling' | 'stable'
  best_time_to_sell: string
  risks: string[]
  transport_tip: string
  market_summary: string
}

export async function analyzeDeals(
  cropName: string,
  cropVariety: string,
  quality: string,
  quantityQuintals: number,
  quantityKg: number,
  district: string,
  state: string,
  moisture: number,
  hasOwnTransport: boolean,
  dealOptions: DealOption[]
): Promise<AIAnalysisResult | null> {
  const prompt = `You are an expert agricultural market analyst in India.

FARMER QUERY:
Crop: ${cropName} (${cropVariety || 'Standard'}, Grade ${quality})
Quantity: ${quantityQuintals} quintals (${quantityKg} kg)
Location: ${district}, ${state}
Moisture Content: ${moisture}%
Has own transport: ${hasOwnTransport}

MARKET OPTIONS FOUND (sorted by net profit):
${dealOptions.map((d, i) => `
${i + 1}. ${d.buyer_name} (${d.buyer_type})
   Distance: ${d.distance_km}km
   Price: ₹${d.price_per_quintal}/quintal
   Transport cost: ₹${d.transport_cost_total}
   Total deductions: ₹${d.total_deductions}
   NET IN HAND: ₹${d.net_profit_in_hand}
   Buyer rating: ${d.buyer_rating}/5
   Verified: ${d.buyer_verified}
   Payment: ${d.payment_terms}
`).join('')}

Please provide:
1. For each option: trust_score (0-100), 2-3 pros, 1-2 cons
2. Which is the BEST DEAL and why (2-3 sentences)
3. Market trend for this crop right now (rising/falling/stable)
4. Best time to sell advice (sell now? wait X days?)
5. Any risks the farmer should know about
6. One-line market summary in simple Hindi + English
7. Transport tip for this quantity and distance

Format as JSON only. Be specific with numbers. Think from a small farmer's perspective.`

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    return JSON.parse(jsonMatch[0]) as AIAnalysisResult
  } catch (error) {
    console.warn('Gemini analysis failed, using fallback:', error)
    return generateFallbackAnalysis(dealOptions, cropName, district, state)
  }
}

function generateFallbackAnalysis(deals: DealOption[], crop: string, district: string, state: string): AIAnalysisResult | null {
  if (deals.length === 0) return null

  const best = deals[0]
  const avgPrice = deals.reduce((s, d) => s + d.price_per_quintal, 0) / deals.length
  const priceRange = Math.max(...deals.map((d) => d.price_per_quintal)) - Math.min(...deals.map((d) => d.price_per_quintal))
  const trend = priceRange > avgPrice * 0.1 ? 'rising' : 'stable'

  return {
    deals: deals.map((d) => ({
      trust_score: Math.min(95, 60 + Math.round(d.buyer_rating * 7) + (d.buyer_verified ? 10 : 0)),
      pros: [
        d.buyer_verified ? 'Verified buyer' : 'Known market',
        d.distance_km < 50 ? 'Relatively close' : 'Major market hub',
        d.payment_terms === 'immediate' ? 'Immediate payment' : 'Regular payment terms',
      ],
      cons: [
        d.distance_km > 100 ? 'Long travel distance' : 'Transport costs apply',
        d.buyer_type === 'mandi' ? 'Commission charges applicable' : 'May have quality requirements',
      ],
    })),
    best_deal: best.buyer_name,
    best_deal_reason: `Highest net profit of ₹${best.net_profit_in_hand.toLocaleString('en-IN')} after all deductions. ${best.buyer_type === 'mandi' ? 'Government mandi ensures transparent weighing and immediate payment.' : 'Direct buyer eliminates commission charges.'}`,
    price_trend: trend,
    best_time_to_sell: trend === 'rising' ? 'Prices are rising. Consider selling within 3-5 days for better rates.' : 'Current prices are fair. Sell within the week for best results.',
    risks: [
      'Weather conditions may affect transport',
      'Market arrivals could impact prices',
    ],
    transport_tip: `For ${deals.reduce((s, d) => Math.max(s, d.distance_km), 0)}km distance, hiring a truck at ₹18-25/km is more cost-effective than tractor.`,
    market_summary: `${crop} market in ${district}, ${state} is currently ${trend}. Best rates available at ${best.buyer_name}.`,
  }
}
