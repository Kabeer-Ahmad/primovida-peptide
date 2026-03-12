'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
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
    <main className="min-h-dvh w-full bg-[#FFFFFF] flex flex-col px-5 py-12 max-w-[390px] mx-auto sm:max-w-lg animate-fade-in">
      <h1 className="text-[#0A0A0A] font-bold text-3xl">First, create your account</h1>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="text-[#0A0A0A] font-medium text-base">First Name</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className="w-full min-h-[48px] rounded-2xl border border-[#E5E7EB] px-4 text-base text-[#0A0A0A] placeholder:text-[#6B7280]"
          placeholder="Your first name"
        />
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
          placeholder="Min 6 characters"
        />
        {error && <p className="text-red-600 text-base">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full min-h-[48px] flex items-center justify-center bg-[#C9A84C] text-[#0A0A0A] font-bold text-base rounded-2xl px-6 py-4 hover:opacity-95 active:scale-[0.98] transition-all duration-200 disabled:opacity-70"
        >
          {loading ? 'Creating account…' : 'Continue to Questions'}
        </button>
      </form>
    </main>
  )
}
