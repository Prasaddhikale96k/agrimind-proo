import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabaseServer = await createClient()
    const { error } = await supabaseServer.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('OAuth exchange error:', error.message)
      return NextResponse.redirect(
        new URL('/landing?error=auth_failed&message=' + encodeURIComponent(error.message), requestUrl.origin)
      )
    }

    const { data: { user } } = await supabaseServer.auth.getUser()

    if (user) {
      const { data: farmer } = await supabase
        .from('farmers')
        .select('location')
        .eq('email', user.email)
        .maybeSingle()

      if (!farmer || !farmer.location) {
        return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}
