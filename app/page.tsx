import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-dvh w-full bg-[#FFFFFF] flex flex-col items-center justify-center px-5 py-12 w-full max-w-[390px] mx-auto sm:max-w-[480px] md:max-w-[520px] lg:max-w-[560px] sm:px-6 relative overflow-hidden">
      {/* Centred gradient blob */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-full opacity-[0.08] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #C9A84C 0%, #3D5A80 65%, transparent 100%)',
        }}
      />
      <div className="relative z-10 w-full flex flex-col items-center text-center">
        <h1 className="text-[#0A0A0A] font-bold text-3xl sm:text-4xl leading-tight max-w-[340px] animate-fade-in-up">
          Your personalised peptide protocol. Built around you.
        </h1>
        <p className="text-[#6B7280] text-base mt-5 max-w-[320px] animate-fade-in-up opacity-0 animate-fill-forwards animate-delay-100">
          Answer 18 questions. Get a protocol written for your body, your goals, and your biology.
        </p>
        <Link
          href="/signup"
          className="mt-10 w-full min-h-[48px] flex items-center justify-center bg-[#C9A84C] text-[#0A0A0A] font-bold text-base rounded-2xl px-6 py-4 hover:opacity-95 active:scale-[0.98] transition-all duration-200 animate-fade-in-up opacity-0 animate-fill-forwards animate-delay-200"
        >
          Build My Protocol
        </Link>
        <p className="text-[#6B7280] text-sm mt-5 animate-fade-in opacity-0 animate-fill-forwards animate-delay-350">
          Free to complete. No card required.
        </p>
      </div>
    </main>
  )
}
