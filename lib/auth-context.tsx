'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import type { SupabaseClient, User, Session } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  supabase: SupabaseClient
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  supabase: createClient(),
  signInWithGoogle: async () => {},
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children, session: initialSession }: { children: React.ReactNode; session?: Session | null }) {
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null)
  const [session, setSession] = useState<Session | null>(initialSession ?? null)
  const [loading, setLoading] = useState(!initialSession)
  const router = useRouter()
  const supabase = createClient()

  const handleSession = useCallback((s: Session | null) => {
    setSession(s)
    setUser(s?.user ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      if (!initialSession) {
        const { data: { session: s } } = await supabase.auth.getSession()
        if (mounted) handleSession(s)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (mounted) handleSession(s)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, handleSession])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    router.push('/landing')
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, supabase, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
