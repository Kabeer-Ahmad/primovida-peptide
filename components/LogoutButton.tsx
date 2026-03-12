'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await createClient().auth.signOut()
    router.replace('/')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-[#6B7280] text-sm font-medium hover:text-[#0A0A0A] transition-colors py-2 px-3 -m-2 rounded-lg hover:bg-[#F3F4F6] min-h-[44px] flex items-center justify-center"
    >
      Sign out
    </button>
  )
}
