import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

const MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID
const ANNUAL_PRICE_ID = process.env.STRIPE_ANNUAL_PRICE_ID
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function POST(req: Request) {
  try {
    const { plan, userId, email } = await req.json()
    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 })
    }
    const priceId =
      plan === 'monthly' ? MONTHLY_PRICE_ID : ANNUAL_PRICE_ID
    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured' }, { status: 500 })
    }
    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/protocol/unlocked?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/protocol/locked`,
      metadata: { supabase_user_id: userId },
    })
    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error('Stripe checkout error', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Checkout failed' },
      { status: 500 }
    )
  }
}
