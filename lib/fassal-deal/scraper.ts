// Run with: npx tsx lib/fassal-deal/scraper.ts
// This fetches real mandi prices from data.gov.in (Agmarknet official API)
// and saves them to Supabase mandi_prices table

import { supabaseAdmin } from '@/lib/supabase'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const AGMARKNET_API_KEY = process.env.AGMARKNET_API_KEY || ''

const supabase = supabaseAdmin

const CROPS = [
  'Tomato', 'Onion', 'Potato', 'Wheat', 'Paddy', 'Rice', 'Maize',
  'Gram', 'Soyabean', 'Cotton', 'Sugarcane', 'Mustard', 'Groundnut',
  'Turmeric', 'Red Chillies', 'Garlic', 'Ginger', 'Banana', 'Grapes',
  'Mango', 'Orange', 'Lemon', 'Brinjal', 'Cucumber', 'Capsicum',
  'Coriander', 'Fenugreek', 'Cabbage', 'Cauliflower', 'Bhindi',
  'Peas', 'Carrot', 'Watermelon', 'Bajra', 'Jowar', 'Barley',
  'Urad', 'Moong', 'Arhar', 'Sesame', 'Sunflower',
]

const KNOWN_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  'nashik': { lat: 19.9975, lng: 73.7898 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'mumbai': { lat: 19.076, lng: 72.8777 },
  'lasalgaon': { lat: 20.0167, lng: 73.9833 },
  'ahmednagar': { lat: 19.0948, lng: 74.748 },
  'jalgaon': { lat: 21.0077, lng: 75.5626 },
  'kolhapur': { lat: 16.705, lng: 74.2433 },
  'satara': { lat: 17.6805, lng: 74.0183 },
  'solapur': { lat: 17.6599, lng: 75.9064 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'aurangabad': { lat: 19.8762, lng: 75.3433 },
  'sangli': { lat: 16.8524, lng: 74.5815 },
  'raigad': { lat: 18.5074, lng: 73.056 },
  'dhule': { lat: 20.9042, lng: 74.7749 },
  'amritsar': { lat: 31.634, lng: 74.8723 },
  'ludhiana': { lat: 30.901, lng: 75.8573 },
  'patiala': { lat: 30.3398, lng: 76.3869 },
  'delhi': { lat: 28.7233, lng: 77.1824 },
  'azadpur': { lat: 28.7233, lng: 77.1824 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'jodhpur': { lat: 26.2389, lng: 73.0243 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'bhopal': { lat: 23.2599, lng: 77.4126 },
  'indore': { lat: 22.7196, lng: 75.8577 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'kanpur': { lat: 26.4499, lng: 80.3319 },
  'agra': { lat: 27.1767, lng: 78.0081 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'hubli': { lat: 15.3647, lng: 75.124 },
  'guntur': { lat: 16.3067, lng: 80.4365 },
  'kurnool': { lat: 15.8281, lng: 78.0373 },
  'vizag': { lat: 17.6868, lng: 83.2185 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'coimbatore': { lat: 11.0168, lng: 76.9558 },
  'madurai': { lat: 9.9252, lng: 78.1198 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'patna': { lat: 25.5941, lng: 85.1376 },
  'guwahati': { lat: 26.1445, lng: 91.7362 },
  'bhubaneswar': { lat: 20.2961, lng: 85.8245 },
  'ranchi': { lat: 23.3441, lng: 85.3096 },
  'raipur': { lat: 21.2514, lng: 81.6296 },
  'chandigarh': { lat: 30.7333, lng: 76.7794 },
  'dehradun': { lat: 30.3165, lng: 78.0322 },
  'shimla': { lat: 31.1048, lng: 77.1734 },
  'srinagar': { lat: 34.0837, lng: 74.7973 },
  'jammu': { lat: 32.7266, lng: 74.857 },
  'dispur': { lat: 26.1433, lng: 91.7869 },
  'agartala': { lat: 23.8315, lng: 91.2868 },
  'aizawl': { lat: 23.7271, lng: 92.7176 },
  'imphal': { lat: 24.817, lng: 93.9368 },
  'kohima': { lat: 25.6747, lng: 94.1119 },
  'shillong': { lat: 25.5788, lng: 91.8933 },
  'gangtok': { lat: 27.3314, lng: 88.6138 },
  'itanagar': { lat: 27.0844, lng: 93.6053 },
  'panaji': { lat: 15.4909, lng: 73.8278 },
  'port blair': { lat: 11.6234, lng: 92.7265 },
  'pondicherry': { lat: 11.9416, lng: 79.8083 },
  'thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
  'kochi': { lat: 9.9312, lng: 76.2673 },
  'kollam': { lat: 8.8932, lng: 76.6141 },
  'thrissur': { lat: 10.5276, lng: 76.2144 },
  'kozhikode': { lat: 11.2588, lng: 75.7804 },
  'tirunelveli': { lat: 8.7139, lng: 77.7567 },
  'salem': { lat: 11.6643, lng: 78.146 },
  'tiruchirappalli': { lat: 10.7905, lng: 78.7047 },
  'erode': { lat: 11.341, lng: 77.7172 },
  'vellore': { lat: 12.9165, lng: 79.1325 },
  'tiruppur': { lat: 11.1085, lng: 77.3411 },
  'dindigul': { lat: 10.3673, lng: 77.9803 },
  'cuddalore': { lat: 11.7447, lng: 79.768 },
  'nagapattinam': { lat: 10.7672, lng: 79.8426 },
  'thanjavur': { lat: 10.787, lng: 79.1378 },
  'karur': { lat: 10.9601, lng: 78.0766 },
  'namakkal': { lat: 11.2213, lng: 78.1761 },
  'dharmapuri': { lat: 12.1219, lng: 78.1575 },
  'krishnagiri': { lat: 12.5269, lng: 78.213 },
  'perambalur': { lat: 11.2342, lng: 78.8805 },
  'ariyalur': { lat: 11.139, lng: 79.0843 },
  'villupuram': { lat: 11.9401, lng: 79.4881 },
  'kanchipuram': { lat: 12.8342, lng: 79.7036 },
  'tiruvannamalai': { lat: 12.2253, lng: 79.0747 },
  'ranipet': { lat: 12.939, lng: 79.3327 },
  'tirupathur': { lat: 12.4926, lng: 78.5694 },
  'chengalpattu': { lat: 12.6921, lng: 79.9765 },
  'kallakurichi': { lat: 11.7427, lng: 78.9613 },
  'mayiladuthurai': { lat: 11.1014, lng: 79.6628 },
  'tenkasi': { lat: 8.9604, lng: 77.3122 },
}

async function fetchMandiPrices(crop: string): Promise<any[]> {
  const params = new URLSearchParams({
    format: 'json',
    data_type: 'json',
    records: '200',
    commodity: crop,
  })

  const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${AGMARKNET_API_KEY}&${params.toString()}`

  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.log(`  Failed for ${crop}: ${res.status}`)
      return []
    }
    const data = await res.json()
    return data?.records || []
  } catch (err) {
    console.log(`  Error for ${crop}:`, err)
    return []
  }
}

function getCoords(mandiName: string): { lat: number; lng: number } | null {
  const lower = mandiName.toLowerCase().replace(/\s*(mandi|apmc|market|grain)\s*/g, '').trim()
  for (const [key, coords] of Object.entries(KNOWN_LOCATIONS)) {
    if (lower.includes(key)) return coords
  }
  return null
}

async function main() {
  console.log('Starting Agmarknet scraper...')
  console.log(`API Key present: ${!!AGMARKNET_API_KEY}`)

  let totalInserted = 0
  let totalFailed = 0

  for (const crop of CROPS) {
    console.log(`\nFetching: ${crop}`)
    const records = await fetchMandiPrices(crop)
    console.log(`  Got ${records.length} records`)

    for (const record of records) {
      const mandiName = record?.market || record?.Market || ''
      const state = record?.state || record?.State || ''
      const district = record?.district || record?.District || ''
      const modalPrice = parseFloat(record?.modal_price || record?.Modal_Price || 0)
      const minPrice = parseFloat(record?.min_price || record?.Min_Price || 0)
      const maxPrice = parseFloat(record?.max_price || record?.Max_Price || 0)
      const arrivalQty = parseFloat(record?.arrival || record?.Arrival || 0)
      const priceDate = record?.price_date || record?.Price_Date || new Date().toISOString().split('T')[0]

      if (!mandiName || !modalPrice) continue

      const coords = getCoords(mandiName)

      const { error } = await supabase.from('mandi_prices').upsert({
        mandi_name: mandiName,
        state,
        district,
        mandi_lat: coords?.lat || null,
        mandi_lng: coords?.lng || null,
        crop_name: crop.toLowerCase(),
        crop_variety: record?.variety || record?.Variety || '',
        min_price: minPrice || null,
        max_price: maxPrice || null,
        modal_price: modalPrice,
        arrival_quantity_quintal: arrivalQty || null,
        price_date: priceDate,
        data_source: 'agmarknet',
        last_updated: new Date().toISOString(),
      }, { onConflict: 'mandi_name,crop_name,price_date' })

      if (error) {
        totalFailed++
      } else {
        totalInserted++
      }
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 500))
  }

  console.log(`\nDone! Inserted: ${totalInserted}, Failed: ${totalFailed}`)
}

main()
