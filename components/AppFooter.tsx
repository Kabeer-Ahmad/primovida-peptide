const DISCLAIMER =
  'This protocol is for educational purposes only and is not medical advice. Always consult a qualified healthcare professional before using any research compound.'

export default function AppFooter() {
  return (
    <footer className="mt-auto w-full max-w-[560px] mx-auto px-4 sm:px-6 pt-2 pb-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <p className="text-[9px] sm:text-[10px] leading-snug text-[#C4C4C4] text-center opacity-90">
        {DISCLAIMER}
      </p>
    </footer>
  )
}

export { DISCLAIMER }
