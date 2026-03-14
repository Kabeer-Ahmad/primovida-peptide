import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'

/**
 * Legacy URL (e.g. Stripe success links). Applies session payment if needed, then sends users to dashboard.
 */
export default async function UnlockedProtocolPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params?.session_id

  const admin = createAdminClient()

  if (sessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId)
      const supabaseUserId = session.metadata?.supabase_user_id as string | undefined
      const customerId = typeof session.customer === 'string' ? session.customer : null
      const isPaid = session.payment_status === 'paid' && customerId && supabaseUserId
      if (isPaid) {
        await admin
          .from('profiles')
          .update({
            stripe_customer_id: customerId,
            payment_status: 'paid',
            subscription_status: 'active',
          })
          .eq('id', supabaseUserId)
      }
    } catch {
      // Session invalid
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(sessionId ? '/signup?from=payment' : '/signup')
  redirect('/dashboard')
}
