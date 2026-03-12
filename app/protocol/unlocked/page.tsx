import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { getProtocolForGoal } from '@/lib/protocols'
import LogoutButton from '@/components/LogoutButton'

const AFFILIATE_LINK = process.env.NEXT_PUBLIC_AFFILIATE_LINK ?? '#'

function formatContent(text: string) {
  const lines = text.split('\n').filter(Boolean)
  return lines.map((line, i) => {
    const parts: React.ReactNode[] = []
    let rest = line
    let key = 0
    while (rest.includes('**')) {
      const start = rest.indexOf('**')
      const end = rest.indexOf('**', start + 2)
      if (end === -1) {
        parts.push(rest)
        break
      }
      parts.push(rest.slice(0, start))
      parts.push(<strong key={key++} className="font-bold text-[#0A0A0A]">{rest.slice(start + 2, end)}</strong>)
      rest = rest.slice(end + 2)
    }
    if (rest) parts.push(rest)
    return <p key={i} className="text-[#374151] leading-[1.7]">{parts}</p>
  })
}

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

  return (
    <main className="min-h-dvh w-full bg-[#FFFFFF] flex flex-col w-full max-w-[390px] mx-auto sm:max-w-[480px] md:max-w-[520px] lg:max-w-[560px] px-4 sm:px-6 py-8 pb-20">
      <header className="mb-8 animate-fade-in">
        <p className="text-[#C9A84C] font-semibold text-sm uppercase tracking-widest">Your protocol</p>
        <h1 className="text-[#0A0A0A] font-bold text-2xl sm:text-3xl mt-1">
          {protocol.compound} — for {firstName || 'you'}
        </h1>
      </header>

      <article className="animate-fade-in-up">
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-6 sm:p-8">
          <div className="space-y-4 text-[#0A0A0A] text-base leading-relaxed">
            {formatContent(content)}
          </div>
        </div>
      </article>

      <section className="mt-10 animate-fade-in-up">
        <div className="rounded-2xl bg-[#0A0A0A] text-white p-6 sm:p-8 shadow-lg">
          <p className="text-[#C9A84C] font-semibold text-sm uppercase tracking-widest">
            Recommended Supplier
          </p>
          <h2 className="text-xl font-bold mt-2">Peptide Sciences</h2>
          <p className="text-[#9CA3AF] text-sm sm:text-base mt-2 leading-relaxed">
            Third-party tested. Ships internationally. Used and trusted.
          </p>
          <Link
            href={AFFILIATE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 block w-full bg-[#C9A84C] text-[#0A0A0A] font-bold text-base py-4 rounded-2xl text-center hover:bg-[#D4B85C] active:scale-[0.98] transition-all duration-200"
          >
            Order Now →
          </Link>
        </div>
      </section>
      <div className="mt-10 pb-8 flex justify-center">
        <LogoutButton />
      </div>
    </main>
  )
}
