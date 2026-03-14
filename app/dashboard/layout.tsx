import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProtocolForGoal } from '@/lib/protocols'
import DashboardLayoutClient from '@/components/DashboardLayoutClient'

/**
 * Dashboard is for paid members only. Unpaid users stay on /protocol/locked.
 * Unauthenticated: still render children so /dashboard?session_id can sync Stripe then redirect signup.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <DashboardLayoutClient user={null}>{children}</DashboardLayoutClient>
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('first_name, email, payment_status')
    .eq('id', user.id)
    .single()

  if (profile?.payment_status !== 'paid') {
    redirect('/protocol/locked')
  }

  const { data: answers } = await admin
    .from('questionnaire_answers')
    .select('goal')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const goal = answers?.goal ?? 'General health'
  const compound = getProtocolForGoal(goal).compound

  return (
    <DashboardLayoutClient
      user={{
        firstName: profile?.first_name ?? '',
        email: profile?.email ?? user.email ?? '',
        paid: true,
        compound,
        goal,
      }}
    >
      {children}
    </DashboardLayoutClient>
  )
}
