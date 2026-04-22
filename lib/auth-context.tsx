'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  supabase: typeof supabase
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  supabase: supabase,
  signInWithGoogle: async () => {},
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children, session: initialSession }: { children: React.ReactNode; session?: Session | null }) {
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null)
  const [session, setSession] = useState<Session | null>(initialSession ?? null)
  const [loading, setLoading] = useState(!initialSession)
  const router = useRouter()

  const supabaseClient = useMemo(() => supabase, [])

  const handleSession = useCallback((s: Session | null) => {
    setSession(s)
    setUser(s?.user ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      if (!initialSession) {
        try {
          const { data: { session: s } } = await supabaseClient.auth.getSession()
          if (mounted) handleSession(s)
        } catch (error) {
          console.error('Auth session error:', error)
          if (mounted) {
            setLoading(false)
            setUser(null)
            setSession(null)
          }
        }
      }
    }

    init()

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, s) => {
      if (mounted) handleSession(s)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabaseClient, handleSession, initialSession])

  const signInWithGoogle = async () => {
    await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const signOut = async () => {
    await supabaseClient.auth.signOut()
    setUser(null)
    setSession(null)
    router.push('/landing')
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, supabase: supabaseClient, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}