import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const { data, error } = await supabaseAdmin
      .from('fassal_deal_searches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ searches: data })
  } catch (error: any) {
    console.error('History Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch history' }, { status: 500 })
  }
}
