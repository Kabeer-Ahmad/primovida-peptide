import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

/** Apply paid status from Checkout then redirect — avoids layout racing before page runs session_id */
export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get('session_id')
  if (!sessionId) {
    return NextResponse.redirect(`${APP_URL}/protocol/locked`)
  }
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId)
    const supabaseUserId = session.metadata?.supabase_user_id as string | undefined
    const customerId = typeof session.customer === 'string' ? session.customer : null
    const isPaid = session.payment_status === 'paid' && customerId && supabaseUserId
    if (isPaid) {
      await createAdminClient()
        .from('profiles')
        .update({
          stripe_customer_id: customerId,
          payment_status: 'paid',
          subscription_status: 'active',
        })
        .eq('id', supabaseUserId)
    }
  } catch {
    // ignore
  }
  return NextResponse.redirect(`${APP_URL}/dashboard`)
}
