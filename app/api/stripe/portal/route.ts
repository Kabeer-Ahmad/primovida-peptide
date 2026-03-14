import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const customerId = searchParams.get('customer_id')
  if (!customerId) {
    return NextResponse.redirect(`${APP_URL}/protocol/locked`)
  }
  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${APP_URL}/dashboard`,
    })
    return NextResponse.redirect(session.url)
  } catch (e) {
    console.error('Portal session error', e)
    return NextResponse.redirect(`${APP_URL}/protocol/locked`)
  }
}
