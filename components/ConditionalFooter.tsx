'use client'

import { usePathname } from 'next/navigation'
import AppFooter from '@/components/AppFooter'

/** Footer disclaimer only after login — not landing, signup, questionnaire, or unlocked (disclaimer lives after vendor there). */
const NO_FOOTER = new Set([
  '/',
  '/signup',
  '/questionnaire',
  '/protocol/unlocked',
])

export default function ConditionalFooter() {
  const pathname = usePathname()
  if (!pathname || NO_FOOTER.has(pathname)) return null
  return <AppFooter />
}
