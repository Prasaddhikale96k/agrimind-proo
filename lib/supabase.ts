import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_key'

declare global {
  var __supabaseClient: ReturnType<typeof createClient> | undefined
  var __supabaseAdminClient: ReturnType<typeof createClient> | undefined
}

function createSupabaseClient(url: string, key: string, options?: Parameters<typeof createClient>[2]) {
  if (globalThis.__supabaseClient) {
    return globalThis.__supabaseClient
  }

  globalThis.__supabaseClient = createClient(url, key, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true,
      storageKey: 'sb-agrimind-auth-token',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      ...options?.auth,
    },
    global: {
      headers: {
        'x-app-name': 'agrimind-pro',
      },
    },
    ...options,
  })

  return globalThis.__supabaseClient
}

function createSupabaseAdminClient(url: string, key: string) {
  if (globalThis.__supabaseAdminClient) {
    return globalThis.__supabaseAdminClient
  }

  globalThis.__supabaseAdminClient = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return globalThis.__supabaseAdminClient
}

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createSupabaseAdminClient(supabaseUrl, supabaseServiceKey)

export default supabase