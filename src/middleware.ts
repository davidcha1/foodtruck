import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const { data: { session }, error } = await supabase.auth.getSession()

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Debug session detection for dashboard/profile routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) {
    console.log('🔍 Middleware Session Debug:', {
      pathname,
      hasSession: !!session,
      sessionError: error?.message,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      cookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value.substring(0, 20) + '...'])),
      timestamp: new Date().toISOString()
    })
  }

  // Define protected routes and auth routes
  const protectedRoutes = ['/profile', '/dashboard', '/listings/create']
  const authRoutes = ['/auth/signin', '/auth/signup']
  
  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Redirect authenticated users away from auth pages
  if (session && isAuthRoute) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Only redirect from protected routes if there's definitely no session
  // Let client-side auth handle role-based checks and edge cases
  if (!session && isProtectedRoute) {
    console.log('🔍 Middleware: Would redirect to signin for:', pathname, 'but temporarily disabled')
    // Temporarily disabled:
    // url.pathname = '/auth/signin'
    // url.searchParams.set('redirectTo', pathname)
    // return NextResponse.redirect(url)
  }

  // For dashboard access, just verify it's a venue owner if there's a session
  // Don't redirect - let client-side show appropriate error messages
  if (session && pathname.startsWith('/dashboard')) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      // If not a venue owner or vendor, redirect to browse page
      if (user?.role !== 'venue_owner' && user?.role !== 'vendor') {
        url.pathname = '/browse'
        return NextResponse.redirect(url)
      }
    } catch (error) {
      // If there's an error checking role, let client-side handle it
      console.warn('Middleware: Error checking user role:', error)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 