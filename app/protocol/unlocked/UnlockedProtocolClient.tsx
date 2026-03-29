'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  Target,
  FlaskConical,
  Heart,
  Pipette,
  Clock,
  Syringe,
  CalendarDays,
  Sparkles,
  ClipboardList,
  Truck,
  Globe,
  MapPin,
} from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'
import type { JournalBlock } from '@/lib/protocolJournal'
import { SUPPLIER_US_HREF, SUPPLIER_WORLDWIDE_HREF } from '@/lib/supplierLinks'

function iconForTitle(title: string): LucideIcon {
  const t = title.toLowerCase()
  if (t.includes('compound')) return FlaskConical
  if (t.includes('why')) return Heart
  if (t.includes('dose')) return Pipette
  if (t.includes('when')) return Clock
  if (t.includes('how')) return Syringe
  if (t.includes('cycle')) return CalendarDays
  if (t.includes('expect')) return Sparkles
  if (t.includes('notes')) return ClipboardList
  return Target
}

function StrongText({ text }: { text: string }) {
  if (!text) return null
  const parts = text.split(/\*\*/)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-bold text-[#0A0A0A]">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

function SectionCard({
  title,
  body,
  variant = 'default',
  IconCmp,
  className = '',
}: {
  title: string
  body: string
  variant?: 'default' | 'gold' | 'slate' | 'muted'
  IconCmp?: LucideIcon
  className?: string
}) {
  const styles = {
    default: 'border-[#E8E4DC] bg-white shadow-[0_4px_24px_rgba(10,10,10,0.04)]',
    gold: 'border-[#C9A84C]/35 bg-gradient-to-br from-[#FFFBF0] to-[#FAF6EB] shadow-[0_8px_32px_rgba(201,168,76,0.12)]',
    slate: 'border-[#3D5A80]/20 bg-gradient-to-br from-[#F4F7FA] to-white',
    muted: 'border-[#E5E7EB] bg-[#FAFAFA]',
  }[variant]
  const Icon = IconCmp ?? iconForTitle(title)
  return (
    <div className={`min-w-0 rounded-2xl border p-3 sm:p-5 ${styles} ${className}`}>
      <div className="flex items-start gap-2 sm:gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${
            variant === 'gold'
              ? 'bg-[#C9A84C]/15 text-[#9A7B2D]'
              : variant === 'slate'
                ? 'bg-[#3D5A80]/10 text-[#3D5A80]'
                : variant === 'muted'
                  ? 'bg-[#E5E7EB] text-[#6B7280]'
                  : 'bg-[#F3F4F6] text-[#C9A84C]'
          }`}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#C9A84C] sm:text-[10px] sm:tracking-[0.2em]">
            {title}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-[#374151] sm:mt-2 sm:text-sm sm:leading-relaxed">
            <StrongText text={body} />
          </p>
        </div>
      </div>
    </div>
  )
}

function ShortFact({
  label,
  value,
  IconCmp,
}: {
  label: string
  value: string
  IconCmp: LucideIcon
}) {
  const I = IconCmp
  return (
    <div className="min-w-0 rounded-2xl border border-[#E8E4DC] bg-white p-3 shadow-sm sm:p-4">
      <div className="flex items-start gap-2 sm:gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C9A84C]/12 text-[#9A7B2D] sm:h-10 sm:w-10">
          <I className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#9CA3AF] sm:text-[10px]">{label}</p>
          <p className="mt-0.5 text-xs font-semibold leading-tight text-[#1A1917] sm:text-sm">{value}</p>
        </div>
      </div>
    </div>
  )
}

let d = 0
function delay() {
  d = Math.min(10, d + 1)
  return `protocol-delay-${d}` as const
}

const SHORT_LEN = 140

/** Always 2 columns on phone + desktop — min-w-0 + gap keeps layout stable */
const COL2 = 'grid grid-cols-2 gap-2 sm:gap-4'

export default function UnlockedProtocolClient({
  blocks,
  compound,
  firstName,
  goal,
  disclaimer,
  embedInDashboard = false,
}: {
  blocks: JournalBlock[]
  compound: string
  firstName: string
  goal: string
  disclaimer: string
  /** When true, shell provides Sign out; trim outer chrome slightly */
  embedInDashboard?: boolean
}) {
  d = 0
  const intro: Extract<JournalBlock, { kind: 'paragraph' }>[] = []
  const sections: Extract<JournalBlock, { kind: 'section' }>[] = []
  const outro: Extract<JournalBlock, { kind: 'paragraph' }>[] = []
  let seenSection = false
  for (const b of blocks) {
    if (b.kind === 'paragraph') {
      if (!seenSection) intro.push(b)
      else outro.push(b)
    } else {
      seenSection = true
      sections.push(b)
    }
  }

  const get = (re: RegExp) => sections.find((s) => re.test(s.title))
  const compoundSec = get(/compound/i)
  const why = get(/why this/i)
  const dose = get(/dose/i)
  const how = get(/how to take/i)
  const when = get(/^when$/i) || get(/\bwhen\b/i)
  const cycle = get(/cycle/i)
  const expect = get(/what to expect/i)
  const notes = get(/notes/i)

  const used = new Set<string>()
  const mark = (s: { title: string } | undefined) => s && used.add(s.title)
  ;[compoundSec, why, dose, how, when, cycle, expect, notes].forEach(mark)

  const doseWhen = [dose, when].filter(Boolean) as { title: string; body: string }[]
  const howCycle = [how, cycle].filter(Boolean) as { title: string; body: string }[]

  const unused = sections.filter((s) => !used.has(s.title))
  const shortPairs: { title: string; body: string }[][] = []
  let i = 0
  while (i < unused.length) {
    const a = unused[i]
    const b = unused[i + 1]
    if (b && a.body.length < SHORT_LEN && b.body.length < SHORT_LEN) {
      shortPairs.push([a, b])
      used.add(a.title)
      used.add(b.title)
      i += 2
    } else i++
  }

  return (
    <main
      className={`min-h-dvh w-full bg-gradient-to-b from-[#FAFAF8] via-[#FFFFFF] to-[#F5F2EC] pb-0 ${embedInDashboard ? 'pt-3 sm:pt-5' : 'pt-[max(0.75rem,env(safe-area-inset-top))]'}`}
    >
      <div className="mx-auto w-full max-w-[680px] px-3 sm:px-6">
        <header
          className={`protocol-section-in ${delay()} relative overflow-hidden rounded-2xl border border-[#1A1917] bg-[#0A0A0A] px-4 py-6 text-white sm:px-8 sm:py-10`}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-2xl"
            style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }}
          />
          <div
            className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full opacity-20 blur-2xl"
            style={{ background: 'radial-gradient(circle, #3D5A80 0%, transparent 70%)' }}
          />
          <div className="relative flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#C9A84C] sm:h-11 sm:w-11">
              <FlaskConical className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C9A84C]">Your protocol</p>
              <h1 className="mt-1 font-serif text-xl font-bold leading-tight sm:text-3xl md:text-[2rem]">{compound}</h1>
              <p className="mt-2 text-xs text-white/75 sm:text-base">
                Built for {firstName || 'you'} · {goal}
              </p>
            </div>
          </div>
        </header>

        <div className={`protocol-section-in ${delay()} ${COL2} mt-4 sm:mt-5`}>
          <ShortFact label="Your goal" value={goal} IconCmp={Target} />
          <ShortFact label="Compound" value={compoundSec?.body?.replace(/\*\*/g, '') || compound} IconCmp={FlaskConical} />
        </div>

        {intro.map((b, j) => (
          <div
            key={j}
            className={`protocol-section-in ${delay()} mt-4 rounded-2xl border border-[#E8E4DC] bg-white/95 p-4 shadow-sm sm:mt-5 sm:p-6`}
          >
            <div className="flex gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#3D5A80]/10 text-[#3D5A80]">
                <ClipboardList className="h-4 w-4" strokeWidth={2} aria-hidden />
              </span>
              <p className="min-w-0 text-sm leading-[1.75] text-[#374151] sm:text-base" style={{ fontFamily: 'Georgia, serif' }}>
                <StrongText text={b.text} />
              </p>
            </div>
          </div>
        ))}

        {compoundSec && compoundSec.body.length > 24 && (
          <div className={`protocol-section-in ${delay()} mt-4 sm:mt-5`}>
            <SectionCard title="The compound" body={compoundSec.body} variant="gold" IconCmp={FlaskConical} />
          </div>
        )}

        {why && (
          <div className={`protocol-section-in ${delay()} mt-4 sm:mt-5`}>
            <SectionCard title="Why this for you" body={why.body} variant="slate" IconCmp={Heart} />
          </div>
        )}

        {doseWhen.length > 0 && (
          <div className={`protocol-section-in ${delay()} ${COL2} mt-4 sm:mt-5`}>
            {doseWhen.map((s) => (
              <SectionCard key={s.title} title={s.title} body={s.body} IconCmp={iconForTitle(s.title)} />
            ))}
          </div>
        )}

        {howCycle.length > 0 && (
          <div className={`protocol-section-in ${delay()} ${COL2} mt-3 sm:mt-4`}>
            {howCycle.map((s) => (
              <SectionCard key={s.title} title={s.title} body={s.body} IconCmp={iconForTitle(s.title)} />
            ))}
          </div>
        )}

        {shortPairs.map((pair, idx) => (
          <div key={idx} className={`protocol-section-in ${delay()} ${COL2} mt-3 sm:mt-4`}>
            {pair.map((s) => (
              <SectionCard key={s.title} title={s.title} body={s.body} IconCmp={iconForTitle(s.title)} />
            ))}
          </div>
        ))}

        {expect && (
          <div className={`protocol-section-in ${delay()} mt-4 sm:mt-5`}>
            <SectionCard title="What to expect" body={expect.body} IconCmp={Sparkles} />
          </div>
        )}

        {notes && (
          <div className={`protocol-section-in ${delay()} mt-3 sm:mt-4`}>
            <SectionCard title="Notes" body={notes.body} variant="muted" IconCmp={ClipboardList} />
          </div>
        )}

        {sections
          .filter((s) => !used.has(s.title))
          .map((s) => (
            <div key={s.title} className={`protocol-section-in ${delay()} mt-3 sm:mt-4`}>
              <SectionCard title={s.title} body={s.body} IconCmp={iconForTitle(s.title)} />
            </div>
          ))}

        {outro.map((b, j) => (
          <div
            key={j}
            className={`protocol-section-in ${delay()} mt-5 rounded-2xl border border-[#C9A84C]/25 bg-[#FFFBF5] p-4 sm:mt-6 sm:p-6`}
          >
            <p
              className="text-center text-sm font-medium leading-relaxed text-[#1A1917] sm:text-base"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              <StrongText text={b.text} />
            </p>
          </div>
        ))}

        <section className={`protocol-section-in ${delay()} mt-8 sm:mt-10`}>
          <div className="rounded-2xl bg-[#0A0A0A] p-5 text-white shadow-xl sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C9A84C]/20 text-[#C9A84C] sm:h-11 sm:w-11">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A84C]">Verified suppliers</p>
                <h2 className="mt-1 text-lg font-bold sm:text-2xl">Where to buy</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#D1D5DB] sm:text-base">
              Open the site that fits your location. Use their search to find{' '}
              <strong className="font-semibold text-white">{compound}</strong> — or the exact peptide name spelled in
              your protocol above — then add it to your cart and check out on their site. We don’t sell products; these
              are independent stores we trust for verification and quality.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:gap-4">
              <Link
                href={SUPPLIER_US_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[52px] w-full flex-col items-center justify-center gap-0.5 rounded-2xl bg-gradient-to-r from-[#C9A84C] to-[#D4B85C] px-4 py-3 text-center text-[#0A0A0A] shadow-[0_6px_24px_rgba(201,168,76,0.35)] transition-all hover:shadow-lg active:scale-[0.99] sm:min-h-[56px] sm:flex-row sm:gap-2"
              >
                <span className="inline-flex items-center gap-2 text-base font-bold">
                  <MapPin className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
                  US only — Apollo Peptide Sciences
                </span>
                <span className="text-xs font-semibold text-[#0A0A0A]/75 sm:ml-1 sm:text-sm">Verified supplier →</span>
              </Link>
              <Link
                href={SUPPLIER_WORLDWIDE_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[52px] w-full flex-col items-center justify-center gap-0.5 rounded-2xl border-2 border-[#C9A84C]/50 bg-white/5 px-4 py-3 text-center text-white transition-all hover:border-[#C9A84C] hover:bg-white/[0.07] active:scale-[0.99] sm:min-h-[56px] sm:flex-row sm:gap-2"
              >
                <span className="inline-flex items-center gap-2 text-base font-bold">
                  <Globe className="h-5 w-5 shrink-0 text-[#C9A84C]" strokeWidth={2} aria-hidden />
                  Worldwide — Vitality Peptides
                </span>
                <span className="text-xs font-semibold text-[#9CA3AF] sm:ml-1 sm:text-sm">Verified supplier →</span>
              </Link>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-[#9CA3AF] sm:text-xs">
              <strong className="font-semibold text-[#D1D5DB]">Worldwide:</strong> check your country’s regulations to
              make sure the item is allowed before you order. Shipping is only available to countries where it is
              permitted.
            </p>
          </div>
        </section>

        <p className={`protocol-section-in ${delay()} mt-5 px-1 text-center text-[10px] leading-relaxed text-[#9CA3AF] sm:mt-6 sm:text-[11px]`}>
          {disclaimer}
        </p>
        {!embedInDashboard ? (
          <div className="mt-6 flex justify-center pb-[max(2rem,env(safe-area-inset-bottom))] sm:mt-8">
            <LogoutButton />
          </div>
        ) : (
          <div className="h-[max(1.25rem,env(safe-area-inset-bottom))] sm:h-8" aria-hidden />
        )}
      </div>
    </main>
  )
}
