'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoadingPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user?.id) return
      createClient()
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setFirstName(data?.first_name ?? ''))
    })
  }, [])

  useEffect(() => {
    const duration = 2500
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const p = Math.min(100, (elapsed / duration) * 100)
      setProgress(p)
      if (p < 100) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => router.replace('/protocol/locked'), 2600)
    return () => clearTimeout(t)
  }, [router])

  return (
    <main className="min-h-dvh w-full bg-[#FFFFFF] flex flex-col items-center justify-center px-5 w-full max-w-[390px] mx-auto sm:max-w-[480px] md:max-w-[520px] lg:max-w-[560px] animate-fade-in">
      <div className="w-14 h-14 rounded-full border-4 border-[#E5E7EB] border-t-[#C9A84C] animate-spin" />
      <p className="mt-6 text-[#0A0A0A] font-bold text-xl text-center">
        Building your protocol, {firstName || '…'}…
      </p>
      <div className="mt-5 w-full max-w-[280px] sm:max-w-[320px] h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#C9A84C] rounded-full animate-progress"
          style={{ width: `${progress}%` }}
        />
      </div>
    </main>
  )
}
