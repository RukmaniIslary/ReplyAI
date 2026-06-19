import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for Supabase auth token cookie (set by @supabase/ssr on login)
  const hasSession =
    request.cookies.has('sb-access-token') ||
    request.cookies.has('sb-refresh-token') ||
    // Supabase SSR stores session under this key pattern
    [...request.cookies.getAll()].some((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))

  // Protect dashboard routes — no session → redirect to login
  if (!hasSession && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from auth pages
  if (hasSession && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next({ request })
}
