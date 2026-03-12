import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProtocolForGoal } from '@/lib/protocols'
import UnlockSection from './UnlockSection'

export default async function LockedProtocolPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/signup')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('first_name, email, payment_status')
    .eq('id', user.id)
    .single()

  if (profile?.payment_status === 'paid') redirect('/protocol/unlocked')

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
    <main className="min-h-dvh w-full bg-[#FFFFFF] flex flex-col max-w-[390px] mx-auto sm:max-w-lg">
      <div className="px-5 pt-8">
        <h1 className="text-[#0A0A0A] font-bold text-3xl">
          Your protocol is ready, {firstName}
        </h1>
        <p className="text-[#6B7280] text-base mt-2">
          Based on your answers, we&apos;ve built a personalised peptide protocol for you.
        </p>
      </div>
      {/* Blurred protocol preview - real content, visually obscured */}
      <div className="relative px-5 pt-6">
        <div
          className="relative select-none overflow-hidden rounded-2xl border border-[#E5E7EB]"
          style={{ maxHeight: '40vh' }}
        >
          <div
            className="prose prose-sm max-w-none p-6 pb-24 text-[#0A0A0A] blur-md pointer-events-none select-none"
            style={{ userSelect: 'none' }}
          >
            {content.split('\n').map((line, i) => (
              <p key={i} className="mb-2">
                {line.startsWith('**') ? <strong>{line.replace(/\*\*/g, '')}</strong> : line}
              </p>
            ))}
          </div>
          {/* White gradient fade at bottom */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(255,255,255,0.9) 70%, #fff 100%)',
            }}
          />
        </div>
      </div>
      <UnlockSection userId={user.id} email={profile?.email ?? user.email ?? ''} />
    </main>
  )
}
