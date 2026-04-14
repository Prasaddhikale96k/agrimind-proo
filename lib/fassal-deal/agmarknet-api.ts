import { scrapeKisanDeals, scrapeCommodityOnline } from './mandi-scraper'
import { fetchMandiPricesViaRAG } from './rag-scraper'

export interface AgmarknetPriceRecord {
  market: string
  state: string
  commodity: string
  variety: string
  modalPrice: number
  minPrice: number
  maxPrice: number
  date: string
  dateReported: string
}

export async function fetchMandiPricesFromAgmarknet(
  cropName: string,
  state?: string,
  market?: string
): Promise<AgmarknetPriceRecord[]> {
  let results: AgmarknetPriceRecord[] = []

  // 1st (fast ~2s): KisanDeals scraper
  const kisanResults = await scrapeKisanDeals(cropName, state, market)
  if (kisanResults.length > 0) {
    results = kisanResults.map((r) => ({
      market: r.market,
      state: state || 'Unknown',
      commodity: cropName,
      variety: r.variety || 'Standard',
      modalPrice: r.modalPrice,
      minPrice: r.minPrice,
      maxPrice: r.maxPrice,
      date: r.date,
      dateReported: r.dateReported || r.date || new Date().toISOString().split('T')[0],
    }))
    console.log(`[agmarknet-api] Got ${results.length} prices from KisanDeals`)
    return results
  }

  // 2nd (fast ~2s): CommodityOnline scraper
  const commResults = await scrapeCommodityOnline(cropName, state)
  if (commResults.length > 0) {
    results = commResults.map((r) => ({
      market: r.market,
      state: state || 'Unknown',
      commodity: cropName,
      variety: r.variety || 'Standard',
      modalPrice: r.modalPrice,
      minPrice: r.minPrice,
      maxPrice: r.maxPrice,
      date: r.date,
      dateReported: r.dateReported || r.date || new Date().toISOString().split('T')[0],
    }))
    console.log(`[agmarknet-api] Got ${results.length} prices from CommodityOnline`)
    return results
  }

  // 3rd (slow ~10s): Gemini RAG — only if scrapers fail
  const ragResults = await fetchMandiPricesViaRAG(cropName, state, 50)
  if (ragResults.length > 0) {
    results = ragResults.map((r: any) => ({
      market: r.market || r.Market || 'Unknown',
      state: r.state || state || 'Unknown',
      commodity: cropName,
      variety: r.variety || 'Standard',
      modalPrice: parseInt(String(r.modal_price || r.modalPrice || r.Modal_Price || 0), 10),
      minPrice: parseInt(String(r.min_price || r.minPrice || r.Min_Price || 0), 10),
      maxPrice: parseInt(String(r.max_price || r.maxPrice || r.Max_Price || 0), 10),
      date: r.date_reported || r.date || r.Date || new Date().toISOString().split('T')[0],
      dateReported: r.date_reported || r.date || r.Date || new Date().toISOString().split('T')[0],
    })).filter((r) => r.modalPrice > 0)
    console.log(`[agmarknet-api] Got ${results.length} prices from Gemini RAG`)
  }

  console.log(`[agmarknet-api] Total: ${results.length} prices for ${cropName} in ${state || 'India'}`)
  return results
}
