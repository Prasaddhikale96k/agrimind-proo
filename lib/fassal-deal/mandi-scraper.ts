import axios from 'axios'
import * as cheerio from 'cheerio'

const CROP_URL_MAP: Record<string, string> = {
  tomato: 'TOMATO',
  onion: 'ONION',
  potato: 'POTATO',
  wheat: 'WHEAT',
  paddy: 'PADDY',
  rice: 'RICE',
  maize: 'MAIZE',
  gram: 'GRAM',
  soyabean: 'SOYABEAN',
  cotton: 'COTTON',
  sugarcane: 'SUGARCANE',
  mustard: 'MUSTARD',
  groundnut: 'GROUNDNUT',
  turmeric: 'TURMERIC',
  redchilli: 'REDCHILLI',
  garlic: 'GARLIC',
  ginger: 'GINGER',
  banana: 'BANANA',
  grapes: 'GRAPES',
  mango: 'MANGO',
  orange: 'ORANGE',
  lemon: 'LEMON',
  brinjal: 'BRINJAL',
  cucumber: 'CUCUMBER',
  capsicum: 'CAPSICUM',
  coriander: 'CORIANDER',
  fenugreek: 'FENUGREEK',
  cabbage: 'CABBAGE',
  cauliflower: 'CAULIFLOWER',
  bhindi: 'BHINDI',
  peas: 'PEAS',
  carrot: 'CARROT',
  watermelon: 'WATERMELON',
  bajra: 'BAJRA',
  jowar: 'JOWAR',
  barley: 'BARLEY',
  urad: 'URAD',
  moong: 'MOONG',
  arhar: 'ARHAR',
  sesamum: 'SESAMUM',
  sunflower: 'SUNFLOWER',
}

const STATE_URL_MAP: Record<string, string> = {
  maharashtra: 'MAHARASHTRA',
  punjab: 'PUNJAB',
  haryana: 'HARYANA',
  delhi: 'DELHI',
  rajasthan: 'RAJASTHAN',
  'madhya pradesh': 'MADHYAPRADESH',
  'uttar pradesh': 'UTTARPRADESH',
  gujarat: 'GUJARAT',
  karnataka: 'KARNATAKA',
  'tamil nadu': 'TAMILNADU',
  'andhra pradesh': 'ANDHRAPRADESH',
  telangana: 'TELANGANA',
  kerala: 'KERALA',
  'west bengal': 'WESTBENGAL',
  bihar: 'BIHAR',
  odisha: 'ODISHA',
  jharkhand: 'JHARKHAND',
  chhattisgarh: 'CHHATTISGARH',
  assam: 'ASSAM',
  uttarakhand: 'UTTARAKHAND',
  'himachal pradesh': 'HIMACHAL',
  goa: 'GOA',
}

export interface MandiPrice {
  market: string
  variety: string
  minPrice: number
  maxPrice: number
  modalPrice: number
  arrival: number
  date: string
  dateReported: string
}

export async function scrapeKisanDeals(commodity: string, state?: string, district?: string): Promise<MandiPrice[]> {
  const cropSlug = CROP_URL_MAP[commodity.toLowerCase()] || commodity.toUpperCase()
  const stateSlug = state ? STATE_URL_MAP[state.toLowerCase()] || state.toUpperCase() : 'ALL'
  const districtSlug = district ? district.toUpperCase() : 'ALL'

  const url = `https://www.kisandeals.com/mandiprices/district/${cropSlug}/${districtSlug}/${stateSlug}`

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 5000,
    })

    const $ = cheerio.load(data)
    const results: MandiPrice[] = []

    $('table tr').each((i, el) => {
      const cols = $(el).find('td')
      if (cols.length >= 8) {
        const market = $(cols[4]).text().trim()
        const variety = $(cols[3]).text().trim()
        const minP = parseFloat($(cols[5]).text().trim().replace(/,/g, '')) || 0
        const modalP = parseFloat($(cols[6]).text().trim().replace(/,/g, '')) || 0
        const maxP = parseFloat($(cols[7]).text().trim().replace(/,/g, '')) || 0
        const date = $(cols[8]).text().trim() || new Date().toISOString().split('T')[0]

        if (market && modalP > 0) {
          results.push({ market, variety, minPrice: minP, maxPrice: maxP, modalPrice: modalP, arrival: 0, date, dateReported: date })
        }
      }
    })

    return results.slice(0, 30)
  } catch (err: any) {
    console.log(`KisanDeals scraping failed: ${err.message}`)
    return []
  }
}

// Fallback: commodityonline
export async function scrapeCommodityOnline(commodity: string, state?: string): Promise<MandiPrice[]> {
  const cropSlug = commodity.toLowerCase().replace(/\s+/g, '-')
  const stateSlug = state ? state.toLowerCase().replace(/\s+/g, '-') : 'india'

  const url = `https://www.commodityonline.com/mandiprices/${cropSlug}/${stateSlug}`

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 5000,
    })

    const $ = cheerio.load(data)
    const results: MandiPrice[] = []

    $('table tr').each((i, el) => {
      if (i === 0) return
      const cols = $(el).find('td')
      if (cols.length >= 9) {
        const variety = $(cols[2]).text().trim()
        const market = $(cols[5]).text().trim()
        const priceStr = (text: string) => parseFloat(text.replace(/Rs\s*|\/\s*Quintal|,/g, '').trim()) || 0
        const minP = priceStr($(cols[6]).text())
        const maxP = priceStr($(cols[7]).text())
        const modalP = priceStr($(cols[8]).text())
        const date = $(cols[1]).text().trim() || new Date().toISOString().split('T')[0]

        if (market && modalP > 0) {
          results.push({ market, variety, minPrice: minP, maxPrice: maxP, modalPrice: modalP, arrival: 0, date, dateReported: date })
        }
      }
    })

    return results.slice(0, 30)
  } catch (err: any) {
    console.log(`CommodityOnline scraping failed: ${err.message}`)
    return []
  }
}
