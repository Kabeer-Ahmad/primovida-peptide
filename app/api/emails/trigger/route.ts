import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import { EMAIL_1 } from '@/lib/emailSequences'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

function markdownToHtml(text: string): string {
  return text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" style="display:inline-block;background:#C9A84C;color:#0A0A0A;font-weight:bold;padding:14px 28px;border-radius:1rem;text-decoration:none;margin-top:16px">$1</a>'
  )
}

export async function POST(req: Request) {
  try {
    const { userId, event } = await req.json()
    if (event !== 'questionnaire_completed' || !userId) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
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
      markdownToHtml(EMAIL_1.body(profile.first_name ?? 'there', unlockUrl))
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
