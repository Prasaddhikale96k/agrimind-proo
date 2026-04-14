import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { query, crop_name, state, district, quantity_quintals } = body

    const { data, error } = await supabaseAdmin
      .from('fassal_search_history')
      .insert({
        query: query || `${crop_name} - ${district || state || 'Unknown'}`,
        crop_name,
        state: state || '',
        district: district || '',
        quantity_quintals: quantity_quintals || 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ message: 'History saved', data })
  } catch (error: any) {
    console.error('Save History Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to save history' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const { data, error } = await supabaseAdmin
      .from('fassal_search_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({ history: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch history' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing history ID' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from('fassal_search_history').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ message: 'History entry deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete history' }, { status: 500 })
  }
}
