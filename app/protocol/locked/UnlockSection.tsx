'use client'

import { useState } from 'react'

export default function UnlockSection({
  userId,
  email,
}: {
  userId: string
  email: string
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
    } catch (e) {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="relative z-20 mt-8 pb-12 w-full animate-fade-in-up">
      <div className="flex flex-col items-center justify-center py-8 rounded-2xl bg-white/90 backdrop-blur-sm">
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
        <p className="text-[#0A0A0A] font-bold text-xl">Unlock to read your full protocol</p>
      </div>
      {error && <p className="mt-4 text-red-600 text-sm text-center">{error}</p>}
      <button
        onClick={handleUnlock}
        disabled={loading}
        className="mt-6 w-full min-h-[48px] flex items-center justify-center bg-[#C9A84C] text-[#0A0A0A] font-bold text-base rounded-2xl hover:opacity-95 active:scale-[0.98] transition-all duration-200"
      >
        {loading ? 'Redirecting…' : 'Unlock My Protocol'}
      </button>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setPlan('monthly')}
          className={`min-h-[56px] rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
            plan === 'monthly'
              ? 'border-[#C9A84C] bg-[#C9A84C]/10'
              : 'border-[#E5E7EB] bg-white'
          }`}
        >
          <span className="font-bold text-base text-[#0A0A0A]">Monthly</span>
          <p className="text-[#6B7280] text-sm mt-0.5">£29/month</p>
          <p className="text-[#6B7280] text-sm">Cancel anytime</p>
        </button>
        <button
          type="button"
          onClick={() => setPlan('annual')}
          className={`min-h-[56px] rounded-2xl border-2 p-4 text-left transition-all duration-200 relative ${
            plan === 'annual'
              ? 'border-[#C9A84C] bg-[#C9A84C]/10'
              : 'border-[#E5E7EB] bg-white'
          }`}
        >
          <span className="absolute top-2 right-2 text-xs font-bold bg-[#C9A84C] text-[#0A0A0A] px-2 py-0.5 rounded-full">
            Save £99
          </span>
          <span className="font-bold text-base text-[#0A0A0A]">Annual</span>
          <p className="text-[#6B7280] text-sm mt-0.5">£249/year</p>
          <p className="text-[#6B7280] text-sm">Best value</p>
        </button>
      </div>
      <p className="text-[#6B7280] text-sm text-center mt-4">
        Secure payment via Stripe. Cancel anytime.
      </p>
    </div>
  )
}
