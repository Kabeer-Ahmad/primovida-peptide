'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function signInAction(email: string, password: string): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  if (!data.user) return { error: 'Sign in failed' }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('payment_status')
    .eq('id', data.user.id)
    .single()

  if (profile?.payment_status === 'paid') {
    redirect('/dashboard')
  }
  redirect('/protocol/locked')
}
