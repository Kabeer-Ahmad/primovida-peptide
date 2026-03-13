'use client'

import { useState } from 'react'

export default function UnlockSection({
  userId,
  email,
  embedded = false,
}: {
  userId: string
  email: string
  embedded?: boolean
}) {
  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUnlock() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          userId,
          email,
          returnBaseUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
        }),
      })
      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
        return
      }
      if (data?.error) setError(data.error)
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className={`w-full ${embedded ? 'mt-4' : 'relative z-20 mt-8 pb-12 animate-fade-in-up'}`}>
      {!embedded && (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/90 py-8 backdrop-blur-sm">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#C9A84C"
            strokeWidth="2"
            className="mb-4"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <p className="text-center text-xl font-bold text-[#0A0A0A]">Unlock to read your full protocol</p>
        </div>
      )}
      {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleUnlock}
        disabled={loading}
        className="mt-4 w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-[#C9A84C] to-[#D4B85C] text-lg font-bold text-[#0A0A0A] shadow-[0_6px_20px_rgba(201,168,76,0.35)] transition-all hover:shadow-[0_8px_26px_rgba(201,168,76,0.42)] active:scale-[0.99] disabled:opacity-70"
      >
        {loading ? 'Redirecting…' : 'Unlock My Protocol'}
      </button>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setPlan('monthly')}
          className={`min-h-[52px] rounded-xl border-2 p-2.5 text-left transition-all sm:min-h-[54px] sm:p-3 ${
            plan === 'monthly'
              ? 'border-[#C9A84C] bg-[#C9A84C]/12 shadow-sm'
              : 'border-[#E8E4DC] bg-[#FAFAF8]'
          }`}
        >
          <span className="text-sm font-bold text-[#1A1917] sm:text-base">Monthly</span>
          <p className="mt-0.5 text-xs text-[#6B6560] sm:text-sm">£29/mo</p>
          <p className="text-xs text-[#9CA3AF]">Cancel anytime</p>
        </button>
        <button
          type="button"
          onClick={() => setPlan('annual')}
          className={`relative min-h-[52px] rounded-xl border-2 p-2.5 text-left transition-all sm:min-h-[54px] sm:p-3 ${
            plan === 'annual'
              ? 'border-[#C9A84C] bg-[#C9A84C]/12 shadow-sm'
              : 'border-[#E8E4DC] bg-[#FAFAF8]'
          }`}
        >
          <span className="absolute right-2 top-2 rounded-full bg-[#C9A84C] px-2 py-0.5 text-[10px] font-bold text-[#1A1917]">
            Save £99
          </span>
          <span className="text-sm font-bold text-[#1A1917] sm:text-base">Annual</span>
          <p className="mt-0.5 text-xs text-[#6B6560] sm:text-sm">£249/yr</p>
          <p className="text-xs text-[#9CA3AF]">Best value</p>
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-[#8B8680] sm:text-sm">
        Secure checkout with Stripe. You keep access to your protocol after unlock.
      </p>
    </div>
  )
}
