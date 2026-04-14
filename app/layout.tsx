import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'AgriMind Pro - AI-Powered Smart Farm Management',
  description: 'Premium AI-powered smart farm management and automation platform',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider session={session}>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1a1a2e',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#00B894',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
