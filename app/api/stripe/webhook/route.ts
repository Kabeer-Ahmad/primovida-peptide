import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { EMAIL_4 } from '@/lib/emailSequences'
import { Resend } from 'resend'

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

function getResend() {
  const key = process.env.RESEND_API_KEY
  return key ? new Resend(key) : null
}

export async function POST(req: Request) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook secret not set' }, { status: 500 })
  }
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }
  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Invalid signature' },
      { status: 400 }
    )
  }
  const admin = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const supabaseUserId = session.metadata?.supabase_user_id
      const customerId = session.customer as string | null
      if (supabaseUserId && customerId) {
        await admin.from('profiles').update({
          stripe_customer_id: customerId,
          payment_status: 'paid',
          subscription_status: 'active',
        }).eq('id', supabaseUserId)
      }
      break
    }
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      const { data: profiles } = await admin
        .from('profiles')
        .select('id, first_name')
        .eq('stripe_customer_id', customerId)
      if (profiles?.length) {
        await admin.from('profiles').update({
          payment_status: 'paid',
          subscription_status: 'active',
        }).eq('id', profiles[0].id)
      }
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      const { data: profiles } = await admin
        .from('profiles')
        .select('id, first_name, email')
        .eq('stripe_customer_id', customerId)
      if (profiles?.length) {
        await admin.from('profiles').update({
          payment_status: 'unpaid',
          subscription_status: 'past_due',
        }).eq('id', profiles[0].id)
        const billingPortalUrl = `${APP_URL}/api/stripe/portal?customer_id=${encodeURIComponent(customerId)}`
        const resend = getResend()
        if (resend && profiles[0].email) {
          await resend.emails.send({
            from: 'PRIMOVIDAL <onboarding@resend.dev>',
            to: profiles[0].email,
            subject: EMAIL_4.subject(),
            html: EMAIL_4.body(profiles[0].first_name ?? 'there', billingPortalUrl).replace(
              /\[([^\]]+)\]\(([^)]+)\)/g,
              '<a href="$2" style="display:inline-block;background:#C9A84C;color:#0A0A0A;font-weight:bold;padding:12px 24px;border-radius:1rem;text-decoration:none;margin-top:16px">$1</a>'
            ),
          })
        }
      }
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      const { data: profiles } = await admin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
      if (profiles?.length) {
        await admin.from('profiles').update({
          payment_status: 'unpaid',
          subscription_status: 'cancelled',
        }).eq('id', profiles[0].id)
      }
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}
