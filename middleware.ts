import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Never block auth routes
  if (pathname.startsWith('/auth/') || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const hasAuthCookie =
    request.cookies.has('sb-access-token') ||
    request.cookies.toString().includes('sb-')

  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isOnboardingRoute = pathname.startsWith('/onboarding')
  const isSettingsRoute = pathname.startsWith('/settings')
  const isLandingRoute = pathname === '/landing' || pathname === '/'

  if (!hasAuthCookie && isDashboardRoute) {
    return NextResponse.redirect(new URL('/landing', request.url))
  }

  if (!hasAuthCookie && isOnboardingRoute) {
    return NextResponse.redirect(new URL('/landing', request.url))
  }

  if (!hasAuthCookie && isSettingsRoute) {
    return NextResponse.redirect(new URL('/landing', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/landing', '/onboarding', '/', '/settings'],
}
