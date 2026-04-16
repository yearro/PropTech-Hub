import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { locales } from './lib/i18n/config'
import { createClient } from '@supabase/supabase-js'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Localization Logic
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!pathnameHasLocale) {
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
    const defaultLocale = (cookieLocale && locales.includes(cookieLocale as any)) ? cookieLocale : 'en'
    
    request.nextUrl.pathname = `/${defaultLocale}${pathname}`
    return NextResponse.redirect(request.nextUrl)
  }

  // 2. Authorization Logic for /admin routes
  // Note: We've moved this logic to AdminLayout (Client Component) because 
  // supabase-js uses localStorage by default, which is not accessible here.
  /*
  if (pathname.includes('/admin')) {
    const hasSession = request.cookies.getAll().some(cookie => 
      cookie.name.includes('supabase-auth-token') || 
      cookie.name.includes('sb-') && cookie.name.includes('-auth-token')
    )
    
    if (!hasSession) {
      const url = request.nextUrl.clone()
      const matches = pathname.match(/^\/([^\/]+)/)
      const locale = matches ? matches[1] : 'en'
      url.pathname = `/${locale}/login`
      return NextResponse.redirect(url)
    }
  }
  */

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip all internal paths (_next) and public files
    '/((?!_next|api|favicon.ico|.*\\.).*)',
  ],
}
