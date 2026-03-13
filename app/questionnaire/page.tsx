'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { savePendingQuestionnaire } from '@/lib/pending-questionnaire'
import { hapticProgress, hapticSelect, hapticSliderTick } from '@/lib/haptics'

/** Order: gender → age → height+weight → … */
const QUESTIONS: {
  id: string
  question: string
  options?: string[]
  type: 'choice' | 'height_weight'
}[] = [
  { id: 'sex', question: 'Biological Sex?', type: 'choice', options: ['Male', 'Female', 'Prefer not to say'] },
  { id: 'age', question: 'Age range?', type: 'choice', options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'] },
  {
    id: 'height_weight',
    question: 'Height & weight',
    type: 'height_weight',
  },
  { id: 'body_shape', question: 'Body shape?', type: 'choice', options: ['Lean', 'Average', 'Carrying extra weight', 'Overweight', 'Very lean want mass'] },
  { id: 'goal', question: "What's your main goal?", type: 'choice', options: ['Recovery', 'Anti-ageing', 'Lose body fat', 'Energy', 'Sleep', 'General health'] },
  { id: 'frustration', question: "What's your biggest frustration?", type: 'choice', options: ['Joint pain', 'Slow recovery', 'Low energy', 'Poor sleep', 'Skin changes', 'Gut', 'Body fat', 'Low libido'] },
  { id: 'activity', question: 'How active are you?', type: 'choice', options: ['5+ times/week', '3-4 times', '1-2 times', 'Sedentary'] },
  { id: 'sleep', question: 'Sleep quality?', type: 'choice', options: ['Great', 'Okay', 'Struggle', 'Consistently poor'] },
  { id: 'energy', question: 'Energy levels?', type: 'choice', options: ['High', 'Moderate', 'Low', 'Very low'] },
  { id: 'recovery', question: 'Recovery speed?', type: 'choice', options: ['Fast', 'Average', 'Slow', 'Very slow'] },
  { id: 'stress', question: 'Stress levels?', type: 'choice', options: ['Low', 'Moderate', 'High', 'Very high'] },
  { id: 'describe', question: 'How would you describe yourself?', type: 'choice', options: ['Athlete', 'Health-conscious', 'Biohacker', 'Professional', 'Recovering from injury'] },
  { id: 'peptide_experience', question: 'Peptide experience?', type: 'choice', options: ['Never', 'Basic supplements', 'Used before', 'Currently on one'] },
  { id: 'concern', question: 'Biggest concern?', type: 'choice', options: ['Finding source', 'Dosing', 'Safety', 'Cost', 'Which to start', 'No concerns'] },
  { id: 'budget', question: 'Monthly budget?', type: 'choice', options: ['Under £50', '£50-100', '£100-200', 'Over £200'] },
  { id: 'expecting_results', question: 'When are you expecting results?', type: 'choice', options: ['Few weeks', '2-3 months', 'Long term', 'Not sure'] },
  { id: 'spoken_doctor', question: 'Spoken to a doctor about peptides?', type: 'choice', options: ['Yes', 'No but will', 'No', 'Self-research only'] },
]

const TOTAL = QUESTIONS.length

function Icon({
  name,
  className = 'w-6 h-6',
}: {
  name: string
  className?: string
}) {
  const stroke = 'currentColor'
  const common = { className, fill: 'none' as const, stroke, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24' }
  switch (name) {
    case 'target':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      )
    case 'frustration':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      )
    case 'user':
      return (
        <svg {...common}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    case 'ruler':
      return (
        <svg {...common}>
          <path d="M21 3 3 21M7 16l-2 2M11 12l-2 2M15 8l-2 2M19 4l-2 2" />
        </svg>
      )
    case 'scale':
      return (
        <svg {...common}>
          <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
          <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
          <path d="M7 21h10" />
          <path d="M12 3v18" />
          <path d="M3 7h2c2 0 4-.67 5.33-2" />
        </svg>
      )
    case 'shape':
      return (
        <svg {...common}>
          <path d="M12 2 2 7l10 5 10-5-10-5Z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      )
    case 'activity':
      return (
        <svg {...common}>
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      )
    case 'moon':
      return (
        <svg {...common}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )
    case 'zap':
      return (
        <svg {...common}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      )
    case 'refresh':
      return (
        <svg {...common}>
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </svg>
      )
    case 'cloud':
      return (
        <svg {...common}>
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        </svg>
      )
    case 'flask':
      return (
        <svg {...common}>
          <path d="M9 3h6M10 9v8a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9" />
          <path d="M8 9h8l-2 4" />
        </svg>
      )
    case 'help':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
        </svg>
      )
    case 'wallet':
      return (
        <svg {...common}>
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
      )
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      )
    case 'stethoscope':
      return (
        <svg {...common}>
          <path d="M4.8 2.3A.2.2 0 1 0 5 3L4.8 2.3" />
          <path d="M18 8a6 6 0 0 0-9.33 5M6 8a6 6 0 0 0 10.17 4.31" />
          <path d="M6 8a2 2 0 1 1 4 0c0 2.5-2 4-2 4M14 8a2 2 0 1 0-4 0c0 2.5 2 4 2 4" />
        </svg>
      )
    case 'award':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      )
    case 'heart':
      return (
        <svg {...common}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    case 'sparkles':
    default:
      return (
        <svg {...common}>
          <path d="m12 3-1.9 5.8-6 1.9 6 1.9L12 21l1.9-5.8 6-1.9-6-1.9L12 3Z" />
        </svg>
      )
  }
}

const QUESTION_ICONS: Record<string, string> = {
  goal: 'target',
  frustration: 'frustration',
  age: 'calendar',
  sex: 'user',
  height_weight: 'ruler',
  body_shape: 'shape',
  activity: 'activity',
  sleep: 'moon',
  energy: 'zap',
  recovery: 'refresh',
  stress: 'cloud',
  peptide_experience: 'flask',
  concern: 'help',
  budget: 'wallet',
  expecting_results: 'clock',
  spoken_doctor: 'stethoscope',
  describe: 'award',
}

/** Small icon per option — keyword match */
function optionIcon(option: string): string {
  const o = option.toLowerCase()
  if (o.includes('sleep') || o.includes('rest')) return 'moon'
  if (o.includes('energy') || o.includes('recovery') && o.includes('slow')) return 'zap'
  if (o.includes('pain') || o.includes('joint')) return 'heart'
  if (o.includes('male') || o.includes('female')) return 'user'
  if (o.includes('never') || o.includes('yes') || o.includes('no')) return 'help'
  if (o.includes('athlete') || o.includes('sport')) return 'activity'
  if (o.includes('£') || o.includes('budget')) return 'wallet'
  return 'sparkles'
}

function cmToFtIn(totalCm: number) {
  const totalIn = Math.round(totalCm / 2.54)
  const ft = Math.floor(totalIn / 12)
  const inch = totalIn % 12
  return { ft, inch, label: `${ft}'${inch}"` }
}

export default function QuestionnairePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  /** Canonical: cm 140–215, kg 40–130 */
  const [heightCm, setHeightCm] = useState(172)
  const [weightKg, setWeightKg] = useState(72)
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')
  const [loading, setLoading] = useState(false)

  const q = QUESTIONS[currentStep]
  const isChoice = q.type === 'choice'
  const isMetrics = q.type === 'height_weight'

  const hasSelection =
    isChoice && answers[q.id] ? true : isMetrics ? true : false

  function selectOption(value: string) {
    hapticSelect()
    setAnswers((a) => ({ ...a, [q.id]: value }))
  }

  function heightSliderValue() {
    if (heightUnit === 'cm') return heightCm
    return Math.round(heightCm / 2.54)
  }
  function heightSliderMin() {
    return heightUnit === 'cm' ? 140 : 55
  }
  function heightSliderMax() {
    return heightUnit === 'cm' ? 215 : 84
  }
  function onHeightSlider(v: number) {
    const nextCm = heightUnit === 'cm' ? v : Math.round(v * 2.54)
    if (nextCm !== heightCm) hapticSliderTick()
    if (heightUnit === 'cm') setHeightCm(v)
    else setHeightCm(nextCm)
  }

  function weightSliderValue() {
    return weightUnit === 'kg' ? weightKg : Math.round(weightKg * 2.20462)
  }
  function weightSliderMin() {
    return weightUnit === 'kg' ? 45 : 100
  }
  function weightSliderMax() {
    return weightUnit === 'kg' ? 130 : 290
  }
  function onWeightSlider(v: number) {
    const nextKg = weightUnit === 'kg' ? v : Math.round(v / 2.20462)
    if (nextKg !== weightKg) hapticSliderTick()
    if (weightUnit === 'kg') setWeightKg(v)
    else setWeightKg(nextKg)
  }

  function metricsLabels() {
    const h =
      heightUnit === 'cm'
        ? `${heightCm} cm`
        : cmToFtIn(heightCm).label
    const w =
      weightUnit === 'kg'
        ? `${weightKg} kg`
        : `${Math.round(weightKg * 2.20462)} lbs`
    return { h, w }
  }

  function persistMetrics() {
    const { h, w } = metricsLabels()
    setAnswers((a) => ({ ...a, height: h, weight: w }))
  }

  function goBack() {
    hapticProgress()
    setCurrentStep((s) => s - 1)
  }

  async function handleNext() {
    if (isMetrics) persistMetrics()
    if (currentStep < TOTAL - 1) {
      hapticProgress()
      setCurrentStep((s) => s + 1)
      return
    }
    setLoading(true)
    const goal = answers.goal ?? 'General health'
    const { h, w } = metricsLabels()
    const fullAnswers = {
      ...answers,
      height: h,
      weight: w,
    }
    savePendingQuestionnaire({ goal, answers: fullAnswers })
    router.push('/signup')
    setLoading(false)
  }

  const headerIcon = QUESTION_ICONS[q.id] ?? 'sparkles'
  const pct = ((currentStep + 1) / TOTAL) * 100

  return (
    <main className="relative flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-gradient-to-b from-[#FAFAF9] via-[#FFFFFF] to-[#F5F4F2]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%230A0A0A'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden px-4 sm:max-w-[480px] sm:px-6 md:max-w-[520px] lg:max-w-[560px] mx-auto">
        <div className="min-safe-top h-5 shrink-0 sm:h-6" aria-hidden />

        {/* Progress — fixed top */}
        <div className="flex shrink-0 items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => (currentStep > 0 ? goBack() : router.push('/'))}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#0A0A0A] shadow-[0_2px_12px_rgba(10,10,10,0.06)] transition-transform active:scale-95"
            aria-label={currentStep > 0 ? 'Back' : 'Back to home'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex justify-between text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              <span>Step {currentStep + 1}</span>
              <span>{TOTAL} total</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#E8E6E3]">
              <div
                className="questionnaire-progress-fill h-full rounded-full bg-[#C9A84C]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <span className="w-11 shrink-0 text-right text-sm font-bold tabular-nums text-[#C9A84C]">
            {Math.round(pct)}%
          </span>
        </div>

        {/* Middle: question header (fixed) + scrollable body */}
        <div
          key={currentStep}
          className="mt-4 flex min-h-0 flex-1 flex-col sm:mt-5"
          style={{
            animation: 'q-option-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
          }}
        >
          <div className="shrink-0 flex flex-col items-center text-center pb-3">
            <div
              className="mb-3 flex h-[64px] w-[64px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#C9A84C]/20 to-[#3D5A80]/15 text-[#3D5A80] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-[#C9A84C]/25 sm:h-[72px] sm:w-[72px]"
              style={{ animation: 'scale-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both' }}
            >
              <Icon name={headerIcon} className="h-8 w-8 text-[#0A0A0A] sm:h-9 sm:w-9" />
            </div>
            <h2 className="max-w-[22ch] text-balance text-xl font-bold leading-tight text-[#0A0A0A] sm:text-2xl">
              {q.question}
            </h2>
          </div>

          {/* Only this region scrolls (options or height/weight fields) */}
          <div
            className="scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] px-0.5 pb-2"
            style={{ touchAction: 'pan-y' }}
          >
            {isChoice && (
              <div className="flex flex-col gap-2.5 sm:gap-3">
                {q.options!.map((opt, i) => {
                  const selected = answers[q.id] === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => selectOption(opt)}
                      className={`group relative flex min-h-[52px] w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-200 active:scale-[0.99] sm:min-h-[56px] sm:px-5 ${
                        selected
                          ? 'border-[#C9A84C] bg-[#C9A84C] text-white shadow-[0_8px_24px_rgba(201,168,76,0.35)]'
                          : 'border-[#E5E7EB] bg-white text-[#0A0A0A] shadow-[0_2px_8px_rgba(10,10,10,0.04)] hover:border-[#C9A84C]/50 hover:shadow-[0_4px_16px_rgba(201,168,76,0.12)]'
                      }`}
                      style={{ animationDelay: `${80 + i * 55}ms` }}
                    >
                      <span
                        className={`q-option-enter flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          selected ? 'bg-white/20 text-white' : 'bg-[#F3F4F6] text-[#3D5A80] group-hover:bg-[#C9A84C]/10'
                        }`}
                        style={{ animationDelay: `${100 + i * 55}ms` }}
                      >
                        <Icon name={optionIcon(opt)} className="h-5 w-5" />
                      </span>
                      <span className="flex-1 text-base font-semibold leading-snug">{opt}</span>
                      {selected && (
                        <span className="q-check-enter flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/25">
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {isMetrics && (
              <div
                className="flex animate-scale-in flex-col gap-6 pb-4 opacity-0"
                style={{ animationFillMode: 'forwards' }}
              >
                <p className="text-center text-sm text-[#6B7280]">Private — used only to tailor your protocol.</p>

                {/* Height */}
                <div className="rounded-2xl border border-[#E8E6E3] bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon name="ruler" className="h-5 w-5 text-[#C9A84C]" />
                      <span className="font-bold text-[#0A0A0A]">Height</span>
                    </div>
                    <div className="flex rounded-xl bg-[#F3F4F6] p-0.5">
                      <button
                        type="button"
                        onClick={() => setHeightUnit('cm')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                          heightUnit === 'cm' ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#6B7280]'
                        }`}
                      >
                        cm
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeightUnit('ft')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                          heightUnit === 'ft' ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#6B7280]'
                        }`}
                      >
                        ft / in
                      </button>
                    </div>
                  </div>
                  <p className="mb-3 text-center text-2xl font-bold tabular-nums text-[#0A0A0A]">
                    {heightUnit === 'cm' ? `${heightCm} cm` : cmToFtIn(heightCm).label}
                  </p>
                  <input
                    type="range"
                    className="range-q w-full"
                    min={heightSliderMin()}
                    max={heightSliderMax()}
                    value={heightSliderValue()}
                    onChange={(e) => onHeightSlider(Number(e.target.value))}
                  />
                  <div className="mt-1 flex justify-between text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF]">
                    <span>{heightUnit === 'cm' ? '140 cm' : `4'7"`}</span>
                    <span>{heightUnit === 'cm' ? '215 cm' : `7'0"`}</span>
                  </div>
                </div>

                {/* Weight */}
                <div className="rounded-2xl border border-[#E8E6E3] bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon name="scale" className="h-5 w-5 text-[#3D5A80]" />
                      <span className="font-bold text-[#0A0A0A]">Weight</span>
                    </div>
                    <div className="flex rounded-xl bg-[#F3F4F6] p-0.5">
                      <button
                        type="button"
                        onClick={() => setWeightUnit('kg')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                          weightUnit === 'kg' ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#6B7280]'
                        }`}
                      >
                        kg
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeightUnit('lbs')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                          weightUnit === 'lbs' ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#6B7280]'
                        }`}
                      >
                        lbs
                      </button>
                    </div>
                  </div>
                  <p className="mb-3 text-center text-2xl font-bold tabular-nums text-[#0A0A0A]">
                    {weightUnit === 'kg' ? `${weightKg} kg` : `${Math.round(weightKg * 2.20462)} lbs`}
                  </p>
                  <input
                    type="range"
                    className="range-q range-q-weight w-full"
                    min={weightSliderMin()}
                    max={weightSliderMax()}
                    value={weightSliderValue()}
                    onChange={(e) => onWeightSlider(Number(e.target.value))}
                  />
                  <div className="mt-1 flex justify-between text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF]">
                    <span>{weightUnit === 'kg' ? '45 kg' : '100 lbs'}</span>
                    <span>{weightUnit === 'kg' ? '130 kg' : '290 lbs'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next — fixed bottom (disabled until answered) */}
        <div className="shrink-0 border-t border-[#E8E6E3]/80 bg-gradient-to-t from-[#F5F4F2] to-[#FAFAF9] pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleNext}
            disabled={loading || !hasSelection}
            className="btn-next w-full"
          >
            <span
              className={`btn-next__inner min-h-[3.25rem] w-full rounded-2xl text-lg font-bold transition-all duration-200 active:scale-[0.98] ${
                hasSelection && !loading
                  ? 'bg-gradient-to-r from-[#C9A84C] to-[#D4B85C] text-[#0A0A0A] shadow-[0_6px_20px_rgba(201,168,76,0.4)]'
                  : 'cursor-not-allowed bg-[#E5E7EB] text-[#9CA3AF]'
              }`}
            >
              <span className="btn-next__label flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#0A0A0A] border-t-transparent" />
                    Saving…
                  </>
                ) : currentStep === TOTAL - 1 ? (
                  <>
                    Continue
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    Next
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </span>
            </span>
          </button>
        </div>
      </div>
    </main>
  )
}
