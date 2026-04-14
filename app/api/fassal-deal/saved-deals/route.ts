import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { market_name, commodity, modal_price, net_in_hand, date_reported, variety, distance_km, buyer_phone } = body

    if (!market_name || !commodity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: existing } = await supabaseAdmin
      .from('fassal_saved_deals')
      .select('id')
      .eq('market_name', market_name)
      .eq('commodity', commodity)
      .eq('date_reported', date_reported)
      .single()

    if (existing) {
      return NextResponse.json({ message: 'Already saved', saved: false })
    }

    const { data, error } = await supabaseAdmin
      .from('fassal_saved_deals')
      .insert({
        market_name,
        commodity,
        modal_price: Math.round(modal_price || 0),
        net_in_hand: Math.round(net_in_hand || 0),
        date_reported: date_reported || new Date().toISOString().split('T')[0],
        variety: variety || 'Standard',
        distance_km: distance_km || 0,
        buyer_phone: buyer_phone || '',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ message: 'Deal saved', saved: true, data })
  } catch (error: any) {
    console.error('Save Deal Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to save deal' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('fassal_saved_deals')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ deals: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch saved deals' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing deal ID' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from('fassal_saved_deals').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ message: 'Deal deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete deal' }, { status: 500 })
  }
}
