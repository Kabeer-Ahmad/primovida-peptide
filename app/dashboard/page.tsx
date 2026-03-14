import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { getProtocolForGoal } from '@/lib/protocols'
import { FlaskConical, ArrowRight } from 'lucide-react'

export default async function DashboardHomePage({
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

  if (!user) {
    redirect(sessionId ? '/signup?from=payment' : '/signup')
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('first_name, email, payment_status')
    .eq('id', user.id)
    .single()

  if (profile?.payment_status !== 'paid') {
    redirect('/protocol/locked')
  }

  const firstName = profile?.first_name ?? ''
  const email = profile?.email ?? user.email ?? ''

  const { data: rows } = await admin
    .from('questionnaire_answers')
    .select('id, goal, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const recent =
    rows?.map((r) => {
      const g = r.goal ?? 'General health'
      const p = getProtocolForGoal(g)
      return {
        id: r.id,
        goal: g,
        compound: p.compound,
        createdAt: r.created_at ? new Date(r.created_at) : new Date(),
      }
    }) ?? []

  if (!recent.length) {
    recent.push({
      id: 'placeholder',
      goal: 'General health',
      compound: getProtocolForGoal('General health').compound,
      createdAt: new Date(),
    })
  }

  const initial = (firstName || email || '?').trim().charAt(0).toUpperCase() || '?'

  return (
    <div className="mx-auto max-w-lg px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:max-w-2xl sm:px-6 sm:pt-6">
      <section className="rounded-2xl border border-[#D4CEC3] bg-gradient-to-br from-[#FDFCF9] to-[#F5F0E8] p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0A0A0A] text-xl font-bold text-[#C9A84C] ring-2 ring-[#C9A84C]/30 sm:h-16 sm:w-16 sm:text-2xl"
            aria-hidden
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="font-serif text-xl font-bold text-[#1A1917] sm:text-2xl">
              Welcome back{firstName ? `, ${firstName}` : ''}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#6B6560]">
              Your protocol turns what you told us into a single, coherent peptide plan — compound, dosing rhythm, and
              cycle length aligned with how you actually live.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#D4CEC3] bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B8680]">How we build your call</h3>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#4B5563]">
          <li>
            <strong className="text-[#1A1917]">Peptides aren’t one-size-fits-all.</strong> Different chains bias toward
            recovery, sleep, body composition, or longevity signals — we start from your stated goal and frustrations,
            not a bestseller list.
          </li>
          <li>
            <strong className="text-[#1A1917]">Context beats labels.</strong> Activity, sleep, stress, and experience
            with research compounds all shift what’s reasonable to suggest first — that’s why the questionnaire exists.
          </li>
          <li>
            <strong className="text-[#1A1917]">Transparency in the doc.</strong> Your protocol narrative explains{' '}
            <em>why</em> this direction fits you, then lays out dose, timing, and cycle so you’re not guessing from
            forums alone.
          </li>
        </ul>
        <p className="mt-4 border-t border-[#E8E4DC] pt-4 text-xs leading-relaxed text-[#9CA3AF]">
          Educational only — not medical advice. Always work with a qualified professional before using any research
          compound.
        </p>
      </section>

      <h3 className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B8680]">Your protocol</h3>
      <ul className="mt-3 space-y-3">
        {recent.map((item) => (
          <li key={item.id}>
            <div className="flex flex-col gap-3 rounded-2xl border border-white/90 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#C9A84C]/12 text-[#9A7B2D]">
                  <FlaskConical className="h-5 w-5" strokeWidth={2} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-[#1A1917]">{item.compound}</p>
                  <p className="mt-0.5 text-sm text-[#6B6560]">Goal: {item.goal}</p>
                  <p className="mt-1 text-[11px] text-[#9CA3AF]">
                    Updated {item.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/protocol"
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] px-5 text-sm font-bold text-[#C9A84C] transition-colors hover:bg-[#1a1a1a] sm:min-w-[8.5rem]"
              >
                Open
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <section className="mt-8 rounded-2xl border border-[#C9A84C]/25 bg-[#FFFBF5] p-5 sm:p-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9A7B2D]">Before you start</h3>
        <p className="mt-3 text-sm leading-relaxed text-[#5C5854]">
          Peptides are powerful because they’re specific — the same compound at the wrong dose or phase wastes time or
          tolerance. Read your full protocol in <strong className="text-[#1A1917]">My protocol</strong> before changing
          anything you’re already doing, and keep a qualified clinician in the loop.
        </p>
      </section>
    </div>
  )
}
