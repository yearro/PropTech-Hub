'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Locale } from '@/lib/i18n/config'

export async function setLocale(locale: Locale, redirectTo?: string) {
  const cookieStore = await cookies()
  cookieStore.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })

  if (redirectTo) {
    redirect(redirectTo)
  }
}
