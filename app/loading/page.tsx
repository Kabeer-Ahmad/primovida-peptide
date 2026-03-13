'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const STEPS = [
  'Reading your goals & profile',
  'Matching peptide fit to you',
  'Shaping dose & cycle guidance',
  'Locking in your personal plan',
]

const TOTAL_MS = 3200
const REDIRECT_MS = 3400

export default function LoadingPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [progress, setProgress] = useState(0)
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user?.id) {
        router.replace('/questionnaire')
        return
      }
      createClient()
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setFirstName(data?.first_name ?? ''))
    })
  }, [router])

  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      setProgress(Math.min(100, (elapsed / TOTAL_MS) * 100))
      const nextStep = Math.min(STEPS.length, 1 + Math.floor(elapsed / (TOTAL_MS / (STEPS.length + 0.5))))
      setVisibleCount((c) => Math.max(c, nextStep))
      if (elapsed < TOTAL_MS) requestAnimationFrame(tick)
      else setProgress(100)
    }
    requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => router.replace('/protocol/locked'), REDIRECT_MS)
    return () => clearTimeout(t)
  }, [router])

  const name = firstName || 'there'

  return (
    <main className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#FAFAF9] via-[#FFFFFF] to-[#F0EEEB] px-5 pb-12 pt-[max(1rem,env(safe-area-inset-top))]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='3' cy='3' r='1.5' fill='%230A0A0A'/%3E%3C/svg%3E")`,
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[28%] h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.12] blur-3xl"
        style={{
          background: 'radial-gradient(circle, #C9A84C 0%, #3D5A80 50%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex w-full max-w-[360px] flex-col items-center sm:max-w-[400px]">
        {/* Spinner stack */}
        <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border-2 border-[#C9A84C]/25"
            style={{ animation: 'loading-pulse-ring 2s ease-in-out infinite' }}
          />
          <div
            className="absolute inset-2 rounded-full border-2 border-[#3D5A80]/20"
            style={{ animation: 'loading-pulse-ring 2s ease-in-out infinite 0.4s' }}
          />
          <div className="absolute flex h-16 w-16 items-center justify-center">
            <div
              className="h-full w-full rounded-full border-[3px] border-[#E8E6E3] border-t-[#C9A84C] border-r-[#3D5A80]/40"
              style={{ animation: 'loading-orbit 0.9s linear infinite' }}
            />
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A84C]/25 to-[#3D5A80]/15 shadow-inner">
            <svg className="h-5 w-5 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
        </div>

        <p className="animate-fade-in-up text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A84C] opacity-0 animate-fill-forwards">
          PRIMOVIDAL
        </p>
        <h1
          className="mt-3 text-balance text-center text-2xl font-bold leading-tight text-[#0A0A0A] sm:text-[1.65rem]"
          style={{ animation: 'signup-fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both' }}
        >
          Building your protocol
        </h1>
        <p
          className="mt-2 text-center text-sm text-[#6B7280]"
          style={{ animation: 'signup-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.16s both' }}
        >
          Hang tight{name !== 'there' ? `, ${name}` : ''} — this only takes a moment.
        </p>

        {/* Progress */}
        <div
          className="mt-8 w-full"
          style={{ animation: 'signup-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both' }}
        >
          <div className="mb-2 flex justify-between text-xs font-semibold text-[#9CA3AF]">
            <span>Progress</span>
            <span className="tabular-nums text-[#C9A84C]">{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[#E8E6E3] shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#3D5A80] to-[#C9A84C] transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step bullets */}
        <ul className="mt-8 w-full space-y-3 text-left">
          {STEPS.slice(0, visibleCount).map((label, i, arr) => {
            const done = i < arr.length - 1 || progress >= 92
            return (
              <li
                key={`${label}-${i}`}
                className="loading-bullet-item flex items-start gap-3 rounded-xl border border-[#E8E6E3]/90 bg-white/70 px-3 py-2.5 shadow-[0_2px_12px_rgba(10,10,10,0.04)]"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
                    done ? 'bg-[#C9A84C]/20' : 'bg-[#F3F4F6]'
                  }`}
                >
                  {done ? (
                    <svg
                      className="loading-check-icon h-4 w-4 text-[#B8923A]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#C9A84C] shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
                  )}
                </span>
                <span
                  className={`pt-0.5 text-sm font-semibold leading-snug ${done ? 'text-[#6B7280]' : 'text-[#0A0A0A]'}`}
                >
                  {label}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </main>
  )
}
