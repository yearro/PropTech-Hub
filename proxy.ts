import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { locales } from './lib/i18n/config'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // Get locale from cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  
  // Simple check: if cookieLocale is valid, use it
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    request.nextUrl.pathname = `/${cookieLocale}${pathname}`
    return NextResponse.redirect(request.nextUrl)
  }

  // Fallback to default locale (English)
  const defaultLocale = 'en'
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    // Skip all internal paths (_next) and public files
    '/((?!_next|api|favicon.ico|.*\\.).*)',
  ],
}
