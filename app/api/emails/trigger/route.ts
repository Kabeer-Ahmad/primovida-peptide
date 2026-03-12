import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail, bodyToEmailHtml } from '@/lib/email'
import { EMAIL_1 } from '@/lib/emailSequences'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, event } = await req.json()
    if (event !== 'questionnaire_completed' || !userId) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    if (user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('first_name, email, payment_status, email_1_sent_at')
      .eq('id', userId)
      .single()
    if (!profile?.email || profile.payment_status === 'paid') {
      return NextResponse.json({ ok: true })
    }
    if (profile.email_1_sent_at) {
      return NextResponse.json({ ok: true })
    }
    const unlockUrl = `${APP_URL}/protocol/locked`
    const sent = await sendEmail(
      profile.email,
      EMAIL_1.subject(profile.first_name ?? 'there'),
      bodyToEmailHtml(EMAIL_1.body(profile.first_name ?? 'there', unlockUrl))
    )
    if (sent) {
      await admin
        .from('profiles')
        .update({ email_1_sent_at: new Date().toISOString() })
        .eq('id', userId)
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Email trigger error', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Trigger failed' },
      { status: 500 }
    )
  }
}
