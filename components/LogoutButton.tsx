'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const router = useRouter()

  async function handleLogout() {
    await createClient().auth.signOut()
    router.replace('/')
    router.refresh()
  }

  const light =
    'text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F3F4F6]'
  const dark = 'text-white/70 hover:text-white hover:bg-white/10'

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`text-sm font-medium transition-colors py-2 px-3 -m-2 rounded-lg min-h-[44px] flex items-center justify-center ${variant === 'dark' ? dark : light}`}
    >
      Sign out
    </button>
  )
}
