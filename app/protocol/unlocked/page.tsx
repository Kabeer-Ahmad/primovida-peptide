import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { getProtocolForGoal } from '@/lib/protocols'
import { parseProtocolJournal } from '@/lib/protocolJournal'
import { DISCLAIMER } from '@/components/AppFooter'
import UnlockedProtocolClient from './UnlockedProtocolClient'

const AFFILIATE_LINK = process.env.NEXT_PUBLIC_AFFILIATE_LINK ?? '#'

export default async function UnlockedProtocolPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params?.session_id

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const admin = createAdminClient()

  if (sessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId)
      const supabaseUserId = session.metadata?.supabase_user_id as string | undefined
      const customerId = typeof session.customer === 'string' ? session.customer : null
      const isPaid = session.payment_status === 'paid' && customerId && supabaseUserId
      if (isPaid) {
        await admin.from('profiles').update({
          stripe_customer_id: customerId,
          payment_status: 'paid',
          subscription_status: 'active',
        }).eq('id', supabaseUserId)
      }
    } catch {
      // Session invalid or Stripe error
    }
  }

  if (!user) redirect(sessionId ? '/signup?from=payment' : '/signup')

  let { data: profile } = await admin
    .from('profiles')
    .select('first_name, payment_status, stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (profile?.payment_status !== 'paid') redirect('/protocol/locked')

  const { data: answers } = await admin
    .from('questionnaire_answers')
    .select('goal')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const goal = answers?.goal ?? 'General health'
  const protocol = getProtocolForGoal(goal)
  const firstName = profile?.first_name ?? ''
  const content = protocol.content(firstName)
  const blocks = parseProtocolJournal(content)

  return (
    <UnlockedProtocolClient
      blocks={blocks}
      compound={protocol.compound}
      firstName={firstName}
      goal={goal}
      affiliateLink={AFFILIATE_LINK}
      disclaimer={DISCLAIMER}
    />
  )
}
