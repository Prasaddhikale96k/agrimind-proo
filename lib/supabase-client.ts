import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key'

declare global {
  var __browserClient: ReturnType<typeof createBrowserClient> | undefined
}

let cachedClient: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  if (cachedClient) {
    return cachedClient
  }

  cachedClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return cachedClient
}