'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromPayment = searchParams.get('from') === 'payment'
  const [isSignIn, setIsSignIn] = useState(fromPayment)
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()

    if (fromPayment || isSignIn) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (!signInError) {
        router.replace(fromPayment ? '/protocol/unlocked' : '/protocol/locked')
        setLoading(false)
        return
      }
      setError(signInError.message)
      setLoading(false)
      return
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName } },
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    if (!authData.user) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      first_name: firstName,
      email,
      payment_status: 'unpaid',
    })
    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }
    router.push('/questionnaire')
    setLoading(false)
  }

  return (
    <main className="min-h-dvh w-full bg-[#FFFFFF] flex flex-col px-5 py-12 w-full max-w-[390px] mx-auto sm:max-w-[480px] md:max-w-[520px] lg:max-w-[560px] sm:px-6 animate-fade-in">
      <h1 className="text-[#0A0A0A] font-bold text-3xl">
        {fromPayment ? 'Sign in to view your protocol' : isSignIn ? 'Welcome back' : 'First, create your account'}
      </h1>
      {fromPayment && (
        <p className="text-[#6B7280] text-base mt-2">Your payment was successful. Sign in with your email and password.</p>
      )}
      {!fromPayment && isSignIn && (
        <p className="text-[#6B7280] text-base mt-2">Sign in to access your protocol and account.</p>
      )}
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        {!fromPayment && !isSignIn && (
          <>
            <label className="text-[#0A0A0A] font-medium text-base">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full min-h-[48px] rounded-2xl border border-[#E5E7EB] px-4 text-base text-[#0A0A0A] placeholder:text-[#6B7280]"
              placeholder="Your first name"
            />
          </>
        )}
        <label className="text-[#0A0A0A] font-medium text-base">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full min-h-[48px] rounded-2xl border border-[#E5E7EB] px-4 text-base text-[#0A0A0A] placeholder:text-[#6B7280]"
          placeholder="you@example.com"
        />
        <label className="text-[#0A0A0A] font-medium text-base">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full min-h-[48px] rounded-2xl border border-[#E5E7EB] px-4 text-base text-[#0A0A0A] placeholder:text-[#6B7280]"
          placeholder={isSignIn ? 'Your password' : 'Min 6 characters'}
        />
        {error && <p className="text-red-600 text-base">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full min-h-[48px] flex items-center justify-center bg-[#C9A84C] text-[#0A0A0A] font-bold text-base rounded-2xl px-6 py-4 hover:opacity-95 active:scale-[0.98] transition-all duration-200 disabled:opacity-70"
        >
          {loading
            ? fromPayment || isSignIn
              ? 'Signing in…'
              : 'Creating account…'
            : fromPayment || isSignIn
              ? 'Sign in'
              : 'Continue to Questions'}
        </button>
      </form>

      {!fromPayment && (
        <div className="mt-8 pt-6 border-t border-[#E5E7EB] text-center">
          <p className="text-[#6B7280] text-base">
            {isSignIn ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignIn(!isSignIn)
                setError(null)
              }}
              className="font-semibold text-[#0A0A0A] underline underline-offset-2 hover:text-[#C9A84C] transition-colors"
            >
              {isSignIn ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      )}
    </main>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<main className="min-h-dvh w-full bg-[#FFFFFF] flex items-center justify-center"><p className="text-[#6B7280]">Loading…</p></main>}>
      <SignupForm />
    </Suspense>
  )
}
