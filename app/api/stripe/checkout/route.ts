import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

const MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID
const ANNUAL_PRICE_ID = process.env.STRIPE_ANNUAL_PRICE_ID
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan, userId, email, returnBaseUrl } = await req.json()
    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 })
    }
    if (user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const priceId =
      plan === 'monthly' ? MONTHLY_PRICE_ID : ANNUAL_PRICE_ID
    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured' }, { status: 500 })
    }
    const baseUrl =
      typeof returnBaseUrl === 'string' && returnBaseUrl
        ? returnBaseUrl.replace(/\/$/, '')
        : APP_URL
    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/api/stripe/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/protocol/locked`,
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
