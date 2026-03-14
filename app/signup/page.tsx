'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  loadPendingQuestionnaire,
  clearPendingQuestionnaire,
} from '@/lib/pending-questionnaire'
import { signInAction } from './actions'

function FieldIcon({ type }: { type: 'user' | 'mail' | 'lock' }) {
  const c = 'h-5 w-5 text-[#9CA3AF]'
  if (type === 'user')
    return (
      <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  if (type === 'mail')
    return (
      <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <path d="m22 6-10 7L2 6" />
      </svg>
    )
  return (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromPayment = searchParams.get('from') === 'payment'
  const signInTab = fromPayment || searchParams.get('signin') === '1'
  const [isSignIn, setIsSignIn] = useState(signInTab)
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
      // Server action sets session cookies on the response — client-only signIn often
      // leaves the server blind on the next RSC request, so /dashboard bounced to signup.
      const result = await signInAction(email, password)
      if (result?.error) {
        setError(result.error)
        setLoading(false)
        return
      }
      // redirect() in action throws; we only get here if something odd happened
      setLoading(false)
      return
    }

    const pending = loadPendingQuestionnaire()
    if (!pending) {
      setError('Please complete the questionnaire first.')
      setLoading(false)
      router.push('/questionnaire')
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
    const goal = pending.goal
    const answersPayload = pending.answers
    await supabase.from('questionnaire_answers').insert({
      user_id: authData.user.id,
      goal,
      answers: answersPayload,
    })
    await supabase
      .from('profiles')
      .update({ questionnaire_completed_at: new Date().toISOString() })
      .eq('id', authData.user.id)
    await fetch('/api/emails/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: authData.user.id,
        event: 'questionnaire_completed',
        questionnaireCompletedAt: new Date().toISOString(),
      }),
    })
    clearPendingQuestionnaire()
    router.push('/loading')
    setLoading(false)
  }

  const isCreate = !fromPayment && !isSignIn

  return (
    <main className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-gradient-to-b from-[#FAFAF9] via-[#FFFFFF] to-[#F5F4F2]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%230A0A0A'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative flex min-h-dvh w-full max-w-[390px] flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:max-w-[440px] sm:px-6 mx-auto">
        {/* Top bar */}
        <div className="signup-enter signup-delay-1 flex shrink-0 items-center justify-between py-2 opacity-0">
          {!fromPayment ? (
            <Link
              href={isCreate ? '/questionnaire' : '/'}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0A0A0A] shadow-[0_2px_12px_rgba(10,10,10,0.06)] transition-transform duration-200 hover:scale-105 active:scale-95"
              aria-label={isCreate ? 'Back to questionnaire' : 'Home'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
          ) : (
            <span className="w-10" />
          )}
          <span className="signup-brand-in signup-delay-2 text-[10px] font-bold uppercase text-[#C9A84C] opacity-0">
            PRIMOVIDAL
          </span>
          <span className="w-10" aria-hidden />
        </div>

        <div className="mt-4 flex flex-1 flex-col sm:mt-6">
          <div className="signup-bar-in signup-delay-2 mb-2 h-1 w-12 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#3D5A80] opacity-0" />
          <h1 className="signup-enter signup-delay-3 text-balance text-2xl font-bold leading-tight text-[#0A0A0A] opacity-0 sm:text-[1.75rem]">
            {fromPayment ? 'Sign in to your protocol' : isSignIn ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="signup-enter signup-delay-4 mt-2 text-sm leading-relaxed text-[#6B7280] opacity-0 sm:text-base">
            {fromPayment && 'Payment received — sign in with the email you used at checkout.'}
            {isCreate && 'Your answers are saved. Add an account so we can build and store your protocol.'}
            {!fromPayment && isSignIn && 'Sign in to open your protocol and manage your account.'}
          </p>

          {!fromPayment && (
            <div className="signup-enter signup-delay-5 mt-6 flex rounded-2xl bg-[#F3F4F6] p-1 opacity-0">
              <button
                type="button"
                onClick={() => {
                  setIsSignIn(false)
                  setError(null)
                }}
                className={`signup-segment-pill flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors duration-200 ${
                  !isSignIn ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#6B7280] hover:text-[#0A0A0A]'
                }`}
              >
                New here
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignIn(true)
                  setError(null)
                }}
                className={`signup-segment-pill flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors duration-200 ${
                  isSignIn ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#6B7280] hover:text-[#0A0A0A]'
                }`}
              >
                Sign in
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 sm:mt-8">
            {isCreate && (
              <div className="signup-enter signup-delay-5 opacity-0">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  First name
                </label>
                <div className="signup-field-shell flex overflow-hidden rounded-2xl border-2 border-[#E8E6E3] bg-white shadow-[0_2px_8px_rgba(10,10,10,0.03)] focus-within:border-[#C9A84C] focus-within:ring-2 focus-within:ring-[#C9A84C]/15">
                  <span className="flex w-12 shrink-0 items-center justify-center border-r border-[#F3F4F6] bg-[#FAFAFA]">
                    <FieldIcon type="user" />
                  </span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    autoComplete="given-name"
                    className="min-h-[52px] flex-1 border-0 bg-transparent px-4 text-base text-[#0A0A0A] outline-none placeholder:text-[#9CA3AF]"
                    placeholder="e.g. Alex"
                  />
                </div>
              </div>
            )}

            <div className={`signup-enter opacity-0 ${isCreate ? 'signup-delay-6' : 'signup-delay-5'}`}>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Email
              </label>
              <div className="signup-field-shell flex overflow-hidden rounded-2xl border-2 border-[#E8E6E3] bg-white shadow-[0_2px_8px_rgba(10,10,10,0.03)] focus-within:border-[#C9A84C] focus-within:ring-2 focus-within:ring-[#C9A84C]/15">
                <span className="flex w-12 shrink-0 items-center justify-center border-r border-[#F3F4F6] bg-[#FAFAFA]">
                  <FieldIcon type="mail" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="min-h-[52px] flex-1 border-0 bg-transparent px-4 text-base text-[#0A0A0A] outline-none placeholder:text-[#9CA3AF]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className={`signup-enter opacity-0 ${isCreate ? 'signup-delay-7' : 'signup-delay-6'}`}>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Password
              </label>
              <div className="signup-field-shell flex overflow-hidden rounded-2xl border-2 border-[#E8E6E3] bg-white shadow-[0_2px_8px_rgba(10,10,10,0.03)] focus-within:border-[#3D5A80] focus-within:ring-2 focus-within:ring-[#3D5A80]/15">
                <span className="flex w-12 shrink-0 items-center justify-center border-r border-[#F3F4F6] bg-[#FAFAFA]">
                  <FieldIcon type="lock" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={isSignIn || fromPayment ? 'current-password' : 'new-password'}
                  className="min-h-[52px] flex-1 border-0 bg-transparent px-4 text-base text-[#0A0A0A] outline-none placeholder:text-[#9CA3AF]"
                  placeholder={isSignIn || fromPayment ? '••••••••' : 'At least 6 characters'}
                />
              </div>
              {isCreate && (
                <p className="mt-1.5 text-xs text-[#9CA3AF]">Use 6+ characters. You’ll use this to sign in later.</p>
              )}
            </div>

            {error && (
              <div
                className="signup-error-in flex gap-3 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                <span className="mt-0.5 shrink-0 text-red-500" aria-hidden>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                </span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`signup-enter mt-2 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#C9A84C] to-[#D4B85C] text-lg font-bold text-[#0A0A0A] opacity-0 shadow-[0_6px_22px_rgba(201,168,76,0.38)] transition-all duration-300 hover:shadow-[0_8px_28px_rgba(201,168,76,0.45)] active:scale-[0.99] disabled:opacity-60 ${
                isCreate ? 'signup-delay-8' : fromPayment ? 'signup-delay-7' : 'signup-delay-7'
              }`}
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#0A0A0A] border-t-transparent" />
                  {fromPayment || isSignIn ? 'Signing in…' : 'Creating account…'}
                </>
              ) : (
                <>
                  {fromPayment || isSignIn ? 'Sign in' : 'Create account & continue'}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {isCreate && (
            <p className="signup-enter signup-delay-9 mt-6 text-center text-xs leading-relaxed text-[#9CA3AF] opacity-0">
              By continuing you agree we store your details to provide your protocol. Not medical advice.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-[#FAFAF9] to-[#F5F4F2]">
          <div className="flex flex-col items-center gap-3 animate-fade-in-up opacity-0 animate-fill-forwards">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#C9A84C] border-t-transparent" />
            <p className="text-sm font-medium text-[#6B7280]">Loading…</p>
          </div>
        </main>
      }
    >
      <SignupForm />
    </Suspense>
  )
}
