import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import UnlockSection from './UnlockSection'
import LogoutButton from '@/components/LogoutButton'
import { journalLineFromAnswers } from '@/lib/lockedJournalLine'

function JournalParagraph({ text }: { text: string }) {
  const parts = text.split(/\*\*/)
  return (
    <p className="mt-2 text-[13px] leading-relaxed text-[#5C5854]" style={{ fontFamily: 'Georgia, serif' }}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-[#1A1917]">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  )
}

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

  const { data: qa } = await admin
    .from('questionnaire_answers')
    .select('goal, answers')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const goal = qa?.goal ?? 'General health'
  const answers = (qa?.answers ?? null) as Record<string, string> | null
  const firstName = profile?.first_name ?? ''
  const journalLine = journalLineFromAnswers(firstName, goal, answers)

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  return (
    <main className="flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-[#F5F2EC] pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col px-4 sm:max-w-[440px] sm:px-5">
        <header className="shrink-0 pt-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B8680]">Your protocol</p>
          <h1 className="mt-1 font-serif text-xl font-bold leading-tight text-[#1A1917]">
            {firstName ? `${firstName}, it’s written.` : 'It’s written.'}
          </h1>
        </header>

        <article
          className="relative mt-3 shrink-0 overflow-hidden rounded-sm border border-[#D4CEC3] bg-[#FDFCF9] shadow-sm"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 22px, rgba(201,168,76,0.05) 22px, rgba(201,168,76,0.05) 23px)`,
          }}
        >
          <div className="absolute bottom-0 left-6 top-0 w-px bg-[#C9A84C]/20" aria-hidden />
          <div className="pl-8 pr-3 py-3 sm:pl-9 sm:pr-4">
            <div className="flex items-center justify-between gap-2 border-b border-[#E8E4DC] pb-2">
              <span className="font-mono text-[10px] text-[#8B8680]">{today}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#C9A84C]/90">Private</span>
            </div>
            <JournalParagraph text={journalLine} />
          </div>
        </article>

        {/* Blur + motion: full height from here down to just above Sign out */}
        <div className="relative mt-3 min-h-0 flex-1 overflow-hidden rounded-xl border border-[#D4CEC3]/60 bg-[#FAF8F4]">
          <div
            className="locked-blur-texture pointer-events-none absolute inset-0 overflow-hidden"
            style={{ filter: 'blur(7px)', transform: 'translateZ(0)' }}
            aria-hidden
          >
            <div className="flex h-[200%] flex-col justify-start gap-3 px-4 pt-4">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="h-2.5 rounded-full bg-[#D8D2C8]"
                  style={{ width: `${68 + (i % 5) * 6}%`, opacity: 0.5 + (i % 3) * 0.12 }}
                />
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#F5F2EC]/30 via-transparent to-[#F5F2EC]/85" />

          <div className="relative z-10 flex h-full min-h-0 flex-col items-center justify-center overflow-y-auto px-1 py-3 sm:px-2">
            <div className="w-full max-w-full rounded-2xl border border-[#E0D9CE] bg-white/92 px-4 py-4 shadow-[0_12px_40px_rgba(26,25,23,0.1)] backdrop-blur-md sm:px-5 sm:py-5">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A84C]/12">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B8923A" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <p className="text-center font-serif text-base font-bold leading-snug text-[#1A1917] sm:text-lg">
                What your body actually needs unlocked.
              </p>
              <p className="mx-auto mt-3 max-w-[32ch] text-center text-[15px] font-semibold leading-snug text-[#1A1917]">
                You&apos;ve been guessing. This stops that.
              </p>
              <p className="mx-auto mt-2 max-w-[34ch] text-center text-xs leading-relaxed text-[#6B6560] sm:text-[13px]">
                Your protocol is built around your body, your goal, and where you are right now. Not a generic plan.
                Yours.
              </p>
              <UnlockSection userId={user.id} email={profile?.email ?? user.email ?? ''} embedded />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-center py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <LogoutButton />
        </div>
      </div>
    </main>
  )
}
