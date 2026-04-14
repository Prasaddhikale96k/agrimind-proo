import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { fetchMandiPricesFromAgmarknet } from '@/lib/fassal-deal/agmarknet-api'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { cropName, state, district, quantityQuintals, grade } = body

    if (!cropName) {
      return NextResponse.json({ error: 'Crop name is required' }, { status: 400 })
    }

    const mandiPrices = await fetchMandiPricesFromAgmarknet(cropName, state || undefined, district || undefined)

    if (mandiPrices.length === 0) {
      return NextResponse.json({ error: 'No market data found for this crop' }, { status: 404 })
    }

    const priceStats = calculatePriceStats(mandiPrices)

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = buildPredictionPrompt(cropName, state, district, priceStats, mandiPrices, quantityQuintals, grade)

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to generate prediction report' }, { status: 500 })
    }

    const prediction = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      prediction,
      priceStats,
      mandiPrices: mandiPrices.slice(0, 20),
      source: 'agmarknet',
    })
  } catch (error: any) {
    console.error('Price Prediction Error:', error)
    return NextResponse.json({ error: error.message || 'Prediction failed' }, { status: 500 })
  }
}

function calculatePriceStats(prices: any[]) {
  const modalPrices = prices.map((p) => p.modalPrice).filter((p) => p > 0)
  const minPrices = prices.map((p) => p.minPrice).filter((p) => p > 0)
  const maxPrices = prices.map((p) => p.maxPrice).filter((p) => p > 0)

  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0
  const min = (arr: number[]) => arr.length ? Math.min(...arr) : 0
  const max = (arr: number[]) => arr.length ? Math.max(...arr) : 0

  return {
    avgModalPrice: avg(modalPrices),
    minModalPrice: min(modalPrices),
    maxModalPrice: max(modalPrices),
    avgMinPrice: avg(minPrices),
    avgMaxPrice: avg(maxPrices),
    totalMarkets: prices.length,
    uniqueMarkets: Array.from(new Set(prices.map((p) => p.market))).length,
    priceRange: max(modalPrices) - min(modalPrices),
    priceSpread: modalPrices.length ? Math.round(((max(modalPrices) - min(modalPrices)) / avg(modalPrices)) * 100) : 0,
  }
}

function buildPredictionPrompt(
  crop: string,
  state: string | undefined,
  district: string | undefined,
  stats: any,
  prices: any[],
  quantity?: number,
  grade?: string
): string {
  const location = district && state ? `${district}, ${state}` : state || 'India'

  const recentPrices = prices.slice(0, 10).map((p, i) =>
    `${i + 1}. ${p.market} | Modal: Rs ${p.modalPrice}/q | Min: Rs ${p.minPrice} | Max: Rs ${p.maxPrice} | Date: ${p.date}`
  ).join('\n')

  return `You are an expert agricultural market analyst for Indian mandis. Analyze the following data and provide a detailed price prediction report.

CROP: ${crop}
LOCATION: ${location}
${quantity ? `QUANTITY: ${quantity} quintals` : ''}
${grade ? `GRADE: ${grade}` : ''}

LIVE MARKET DATA (from Agmarknet):
${recentPrices}

PRICE STATISTICS:
- Average Modal Price: Rs ${stats.avgModalPrice}/quintal
- Price Range: Rs ${stats.minModalPrice} - Rs ${stats.maxModalPrice}/quintal
- Average Min Price: Rs ${stats.avgMinPrice}/quintal
- Average Max Price: Rs ${stats.avgMaxPrice}/quintal
- Markets Covered: ${stats.totalMarkets} entries across ${stats.uniqueMarkets} markets
- Price Spread: ${stats.priceSpread}%

Based on this live market data, provide a comprehensive prediction report as JSON:

{
  "currentSituation": "2-3 sentence summary of current market conditions for ${crop} in ${location}",
  "priceTrend": "rising" or "falling" or "stable",
  "confidenceScore": 0-100,
  "predictedPrice7Days": { "min": number, "max": number, "modal": number },
  "predictedPrice14Days": { "min": number, "max": number, "modal": number },
  "predictedPrice30Days": { "min": number, "max": number, "modal": number },
  "bestTimeToSell": "Specific advice on when to sell (1-2 sentences)",
  "bestMarket": "Name of the market with best prices from the data",
  "bestMarketReason": "Why this market offers the best deal (1-2 sentences)",
  "risks": ["risk 1", "risk 2", "risk 3"],
  "opportunities": ["opportunity 1", "opportunity 2"],
  "transportAdvice": "Advice on transport costs and logistics for this quantity",
  "qualityPremium": "How much premium can be expected for better grade/moisture",
  "governmentMSP": "Current MSP for ${crop} if applicable, or 'Not applicable'",
  "summary": "One-line summary in simple Hindi + English for the farmer"
}

Use realistic numbers based on the provided data. Be specific and actionable. Think from a small farmer's perspective.`
}
