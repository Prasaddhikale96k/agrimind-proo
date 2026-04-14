import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { fetchMandiPricesFromAgmarknet } from '@/lib/fassal-deal/agmarknet-api'
import { fetchMandiPricesViaRAG } from '@/lib/fassal-deal/rag-scraper'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const crop = searchParams.get('crop')
    const state = searchParams.get('state')
    const district = searchParams.get('district')
    const source = searchParams.get('source') || 'all'

    if (!crop) {
      return NextResponse.json({ error: 'Crop name is required' }, { status: 400 })
    }

    const results: any[] = []

    if (source === 'all' || source === 'agmarknet') {
      const mandiRecords = await fetchMandiPricesFromAgmarknet(crop, state || undefined, district || undefined)
      results.push(...mandiRecords)
    }

    if (results.length === 0 && (source === 'all' || source === 'rag')) {
      const ragResults = await fetchMandiPricesViaRAG(crop, state || undefined, 50)
      results.push(...ragResults)
    }

    if (source === 'all' || source === 'local') {
      let query = supabaseAdmin
        .from('mandi_prices')
        .select('*')
        .eq('crop_name', crop.toLowerCase())

      if (state) query = query.eq('state', state)
      if (district) query = query.eq('district', district)

      const { data } = await query.order('price_date', { ascending: false }).limit(50)
      if (data) results.push(...data)
    }

    // Deduplicate by market + date
    const seen = new Set<string>()
    const deduped = results.filter((r) => {
      const key = `${r.market}-${r.date || ''}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    return NextResponse.json({ prices: deduped, count: deduped.length })
  } catch (error: any) {
    console.error('Mandi Prices Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch prices' }, { status: 500 })
  }
}
