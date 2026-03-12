import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { EMAIL_2, EMAIL_3 } from '@/lib/emailSequences'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET

function getResend() {
  const key = process.env.RESEND_API_KEY
  return key ? new Resend(key) : null
}

function markdownToHtml(text: string): string {
  return text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" style="display:inline-block;background:#C9A84C;color:#0A0A0A;font-weight:bold;padding:14px 28px;border-radius:1rem;text-decoration:none;margin-top:16px">$1</a>'
  )
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const admin = createAdminClient()
  const now = new Date()
  const unlockUrl = `${APP_URL}/protocol/locked`

  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000)
  const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000)
  const seventyThreeHoursAgo = new Date(now.getTime() - 73 * 60 * 60 * 1000)

  const { data: profiles24 } = await admin
    .from('profiles')
    .select('id, first_name, email')
    .eq('payment_status', 'unpaid')
    .not('questionnaire_completed_at', 'is', null)
    .lt('questionnaire_completed_at', twentyFourHoursAgo.toISOString())
    .gt('questionnaire_completed_at', twentyFiveHoursAgo.toISOString())
    .is('email_2_sent_at', null)

  const { data: profiles72 } = await admin
    .from('profiles')
    .select('id, first_name, email')
    .eq('payment_status', 'unpaid')
    .not('questionnaire_completed_at', 'is', null)
    .lt('questionnaire_completed_at', seventyTwoHoursAgo.toISOString())
    .gt('questionnaire_completed_at', seventyThreeHoursAgo.toISOString())
    .is('email_3_sent_at', null)

  const resend = getResend()
  if (resend) {
    for (const p of profiles24 ?? []) {
      await resend.emails.send({
        from: 'PRIMOVIDAL <onboarding@resend.dev>',
        to: p.email,
        subject: EMAIL_2.subject(p.first_name ?? 'there'),
        html: markdownToHtml(EMAIL_2.body(p.first_name ?? 'there', unlockUrl)),
      })
      await admin.from('profiles').update({ email_2_sent_at: now.toISOString() }).eq('id', p.id)
    }
    for (const p of profiles72 ?? []) {
      await resend.emails.send({
        from: 'PRIMOVIDAL <onboarding@resend.dev>',
        to: p.email,
        subject: EMAIL_3.subject(p.first_name ?? 'there'),
        html: markdownToHtml(EMAIL_3.body(p.first_name ?? 'there', unlockUrl)),
      })
      await admin.from('profiles').update({ email_3_sent_at: now.toISOString() }).eq('id', p.id)
    }
  }

  return NextResponse.json({
    ok: true,
    sent_24h: profiles24?.length ?? 0,
    sent_72h: profiles72?.length ?? 0,
  })
}
