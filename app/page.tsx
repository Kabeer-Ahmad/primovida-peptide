import Link from 'next/link'
import { Fraunces } from 'next/font/google'

const display = Fraunces({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-landing-display',
})

const DOT_PATTERN = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230A0A0A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`

export default function LandingPage() {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center bg-[#EDECEA] px-3 py-3 sm:px-4 sm:py-4">
      <main
        className={`landing-hero relative flex min-h-0 w-full max-w-[390px] flex-1 flex-col items-center justify-center overflow-hidden rounded-[1.75rem] shadow-[0_8px_40px_rgba(10,10,10,0.06)] sm:max-w-[480px] sm:rounded-[2rem] md:max-w-[520px] lg:max-w-[560px] ${display.variable}`}
        style={{ maxHeight: 'calc(100dvh - 5.5rem)' }}
      >
        {/* Full-bleed background (clipped to rounded main) */}
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-[#FAFAF9] via-[#FFFFFF] to-[#F8F7F5]" />
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.035]"
          style={{
            backgroundImage: DOT_PATTERN,
            backgroundRepeat: 'repeat',
          }}
        />
        <div
          className="pointer-events-none absolute -right-24 -top-20 h-[280px] w-[280px] rounded-full opacity-[0.12] blur-2xl"
          style={{
            background: 'radial-gradient(circle, #3D5A80 0%, transparent 70%)',
          }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-[42%] h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 animate-landing-glow rounded-full opacity-[0.14] blur-3xl sm:h-[420px] sm:w-[420px]"
          style={{
            background: 'radial-gradient(circle, #C9A84C 0%, #3D5A80 45%, transparent 72%)',
          }}
        />

        {/* Content — scroll locked: card must fit viewport */}
        <div className="relative z-10 flex w-full max-h-full min-h-0 flex-1 items-center overflow-hidden px-4 py-5 sm:px-6 sm:py-6">
          <div className="mx-auto flex w-full min-h-[min(58vh,380px)] max-h-full flex-col justify-center rounded-[1.5rem] border border-[#E8E6E3] bg-white/90 px-6 py-10 shadow-[0_4px_6px_-1px_rgba(10,10,10,0.04),0_20px_50px_-12px_rgba(10,10,10,0.08)] backdrop-blur-md sm:min-h-[min(52vh,440px)] sm:rounded-[1.75rem] sm:px-9 sm:py-12">
            <div className="flex flex-col items-center text-center">
            <p className="animate-fade-in-up text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C9A84C] sm:text-xs">
              PRIMOVIDAL
            </p>
            <span className="animate-fade-in-up mt-3 h-1 w-12 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#3D5A80] opacity-90 opacity-0 animate-fill-forwards animate-delay-100" />
            <h1
              className="animate-fade-in-up mt-4 text-[1.25rem] font-semibold leading-[1.22] text-[#0A0A0A] opacity-0 animate-fill-forwards animate-delay-100 sm:text-[1.45rem]"
              style={{ fontFamily: 'var(--font-landing-display), Georgia, serif' }}
            >
              Using the wrong peptide could cost you more than you think.
            </h1>
            <p className="animate-fade-in-up mt-4 max-w-[20rem] text-[0.9375rem] leading-relaxed text-[#5C6370] opacity-0 animate-fill-forwards animate-delay-150 sm:text-base">
              Most people guess. Your body deserves better than that.
            </p>
            <p className="animate-fade-in-up mt-3 max-w-[18rem] text-xs font-medium text-[#3D5A80] opacity-0 animate-fill-forwards animate-delay-200 sm:text-sm">
              Find out exactly what&apos;s right for yours.
            </p>
            <Link
              href="/questionnaire"
              className="animate-fade-in-up mt-7 flex min-h-[50px] w-full items-center justify-center rounded-2xl bg-[#C9A84C] px-6 text-lg font-bold text-[#0A0A0A] shadow-[0_4px_14px_rgba(201,168,76,0.35)] transition-all duration-200 opacity-0 animate-fill-forwards animate-delay-250 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(201,168,76,0.45)] active:translate-y-0 active:scale-[0.99]"
            >
              Build My Protocol
            </Link>
            <p className="animate-fade-in mt-4 text-sm text-[#6B7280] opacity-0 animate-fill-forwards animate-delay-350">
              Takes 2 minutes. Get your personalised protocol.
            </p>
            </div>
          </div>
        </div>
      </main>
      <p className="mt-2 w-full max-w-[390px] shrink-0 px-4 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] text-center text-[11px] leading-snug text-[#8B8A88] sm:max-w-[480px] sm:text-xs">
        Already Registered?{' '}
        <Link
          href="/signup?signin=1"
          className="font-semibold text-[#3D5A80] underline decoration-[#C9A84C]/60 underline-offset-[3px] transition-colors hover:text-[#C9A84C]"
        >
          Sign In
        </Link>
        <span className="text-[#A8A6A3]"> — we saved your spot.</span>
      </p>
    </div>
  )
}
