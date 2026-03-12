import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProtocolForGoal } from '@/lib/protocols'
import UnlockSection from './UnlockSection'
import LogoutButton from '@/components/LogoutButton'

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
    <main className="min-h-dvh w-full bg-[#FFFFFF] flex flex-col w-full max-w-[390px] mx-auto sm:max-w-[480px] md:max-w-[520px] lg:max-w-[560px] px-4 sm:px-6">
      <div className="pt-6 sm:pt-8">
        <h1 className="text-[#0A0A0A] font-bold text-3xl">
          Your protocol is ready, {firstName}
        </h1>
        <p className="text-[#6B7280] text-base mt-2">
          Based on your answers, we&apos;ve built a personalised peptide protocol for you.
        </p>
      </div>
      {/* Blurred protocol preview - real content, visually obscured */}
      <div className="relative pt-6">
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
          {/* White gradient fade at bottom (behind overlay so text stays on top) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, transparent 30%, rgba(255,255,255,0.85) 60%, #fff 100%)',
            }}
          />
          {/* Motivational overlay - no product reveal */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center px-6 py-8">
            <div className="rounded-xl bg-white/80 backdrop-blur-sm px-5 py-4 max-w-[300px]">
              <p className="text-[#0A0A0A] font-semibold text-center text-sm sm:text-base leading-relaxed">
                Your exact compound, dose, and cycle — tailored to your goal.
              </p>
              <p className="text-[#6B7280] text-center text-sm mt-3 leading-relaxed">
                Backed by research. Written for you. Unlock to see your full protocol and where we recommend you source from.
              </p>
            </div>
          </div>
        </div>
      </div>
      <UnlockSection userId={user.id} email={profile?.email ?? user.email ?? ''} />
      <div className="mt-8 pb-12 flex justify-center">
        <LogoutButton />
      </div>
    </main>
  )
}
