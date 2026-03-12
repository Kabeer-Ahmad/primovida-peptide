import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProtocolForGoal } from '@/lib/protocols'

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
      parts.push(<strong key={key++}>{rest.slice(start + 2, end)}</strong>)
      rest = rest.slice(end + 2)
    }
    if (rest) parts.push(rest)
    return <p key={i} className="mb-3 text-base leading-relaxed">{parts}</p>
  })
}

export default async function UnlockedProtocolPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/signup')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('first_name, payment_status')
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
    <main className="min-h-dvh w-full bg-[#FFFFFF] flex flex-col max-w-[390px] mx-auto sm:max-w-lg px-5 py-8 pb-16">
      <article className="prose prose-base max-w-none text-[#0A0A0A] animate-fade-in">
        {formatContent(content)}
      </article>
      <div className="mt-10 p-6 rounded-2xl bg-[#0A0A0A] text-white animate-fade-in-up">
        <p className="text-base text-[#C9A84C] font-semibold uppercase tracking-widest">
          Recommended Supplier
        </p>
        <h3 className="text-xl font-bold mt-1">Peptide Sciences</h3>
        <p className="text-base text-gray-300 mt-2">
          Third-party tested. Ships internationally. Used and trusted.
        </p>
        <Link
          href={AFFILIATE_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block w-full bg-[#C9A84C] text-black font-bold text-base py-4 rounded-2xl text-center hover:opacity-95 active:scale-[0.98] transition-all duration-200"
        >
          Order Now →
        </Link>
      </div>
    </main>
  )
}
