'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const QUESTIONS: {
  id: string
  question: string
  options?: string[]
  type: 'choice' | 'height' | 'weight'
}[] = [
  { id: 'goal', question: 'What\'s your main goal?', type: 'choice', options: ['Recovery', 'Anti-ageing', 'Lose body fat', 'Energy', 'Sleep', 'General health'] },
  { id: 'frustration', question: 'What\'s your biggest frustration?', type: 'choice', options: ['Joint pain', 'Slow recovery', 'Low energy', 'Poor sleep', 'Skin changes', 'Gut', 'Body fat', 'Low libido'] },
  { id: 'age', question: 'Age range?', type: 'choice', options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'] },
  { id: 'sex', question: 'Biological sex?', type: 'choice', options: ['Male', 'Female', 'Prefer not to say'] },
  { id: 'height', question: 'Height?', type: 'height' },
  { id: 'weight', question: 'Weight?', type: 'weight' },
  { id: 'body_shape', question: 'Body shape?', type: 'choice', options: ['Lean', 'Average', 'Carrying extra weight', 'Overweight', 'Very lean want mass'] },
  { id: 'activity', question: 'How active are you?', type: 'choice', options: ['5+ times/week', '3-4 times', '1-2 times', 'Sedentary'] },
  { id: 'sleep', question: 'Sleep quality?', type: 'choice', options: ['Great', 'Okay', 'Struggle', 'Consistently poor'] },
  { id: 'energy', question: 'Energy levels?', type: 'choice', options: ['High', 'Moderate', 'Low', 'Very low'] },
  { id: 'recovery', question: 'Recovery speed?', type: 'choice', options: ['Fast', 'Average', 'Slow', 'Very slow'] },
  { id: 'stress', question: 'Stress levels?', type: 'choice', options: ['Low', 'Moderate', 'High', 'Very high'] },
  { id: 'peptide_experience', question: 'Peptide experience?', type: 'choice', options: ['Never', 'Basic supplements', 'Used before', 'Currently on one'] },
  { id: 'concern', question: 'Biggest concern?', type: 'choice', options: ['Finding source', 'Dosing', 'Safety', 'Cost', 'Which to start', 'No concerns'] },
  { id: 'budget', question: 'Monthly budget?', type: 'choice', options: ['Under £50', '£50-100', '£100-200', 'Over £200'] },
  { id: 'expecting_results', question: 'When expecting results?', type: 'choice', options: ['Few weeks', '2-3 months', 'Long term', 'Not sure'] },
  { id: 'spoken_doctor', question: 'Spoken to a doctor?', type: 'choice', options: ['Yes', 'No but will', 'No', 'Self-research'] },
  { id: 'describe', question: 'Describe yourself?', type: 'choice', options: ['Athlete', 'Health-conscious', 'Biohacker', 'Professional', 'Recovering from injury'] },
]

const TOTAL = QUESTIONS.length

export default function QuestionnairePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [heightValue, setHeightValue] = useState('')
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm')
  const [weightValue, setWeightValue] = useState('')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<{ user: { id: string } } | null>(null)

  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session: s } }) => setSession(s ?? null))
  }, [])

  const q = QUESTIONS[currentStep]
  const isChoice = q.type === 'choice'
  const isHeight = q.type === 'height'
  const isWeight = q.type === 'weight'

  const currentValue = isHeight
    ? (heightValue ? `${heightValue} ${heightUnit}` : '')
    : isWeight
      ? (weightValue ? `${weightValue} ${weightUnit}` : '')
      : answers[q.id] ?? ''

  const hasSelection =
    isChoice && answers[q.id]
      ? true
      : isHeight
        ? !!heightValue
        : isWeight
          ? !!weightValue
          : false

  function selectOption(value: string) {
    setAnswers((a) => ({ ...a, [q.id]: value }))
  }

  function submitHeight() {
    if (heightValue) setAnswers((a) => ({ ...a, height: `${heightValue} ${heightUnit}` }))
  }
  function submitWeight() {
    if (weightValue) setAnswers((a) => ({ ...a, weight: `${weightValue} ${weightUnit}` }))
  }

  async function handleNext() {
    if (isHeight && heightValue) submitHeight()
    if (isWeight && weightValue) submitWeight()
    if (currentStep < TOTAL - 1) {
      setCurrentStep((s) => s + 1)
      return
    }
    setLoading(true)
    const supabase = createClient()
    const goal = answers.goal ?? 'General health'
    const { error } = await supabase.from('questionnaire_answers').insert({
      user_id: session?.user?.id,
      goal,
      answers: { ...answers, ...(heightValue ? { height: `${heightValue} ${heightUnit}` } : {}), ...(weightValue ? { weight: `${weightValue} ${weightUnit}` } : {}) },
    })
    if (error) {
      setLoading(false)
      return
    }
    await supabase
      .from('profiles')
      .update({ questionnaire_completed_at: new Date().toISOString() })
      .eq('id', session?.user?.id)
    await fetch('/api/emails/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: session?.user?.id,
        event: 'questionnaire_completed',
        questionnaireCompletedAt: new Date().toISOString(),
      }),
    })
    router.push('/loading')
    setLoading(false)
  }

  if (session === null) {
    return (
      <main className="min-h-dvh w-full bg-[#FFFFFF] flex items-center justify-center px-5">
        <p className="text-[#6B7280]">Loading…</p>
      </main>
    )
  }

  if (!session) {
    router.replace('/signup')
    return null
  }

  return (
    <main className="min-h-dvh w-full bg-[#FFFFFF] flex flex-col max-w-[390px] mx-auto sm:max-w-lg relative">
      {/* Progress bar */}
      <div className="h-1.5 w-full bg-[#E5E7EB]">
        <div
          className="h-full bg-[#C9A84C] rounded-r-full animate-progress"
          style={{ width: `${((currentStep + 1) / TOTAL) * 100}%` }}
        />
      </div>
      <p className="text-[#6B7280] text-base px-5 pt-3">Question {currentStep + 1} of {TOTAL}</p>

      {/* Back */}
      {currentStep > 0 && (
        <button
          type="button"
          onClick={() => setCurrentStep((s) => s - 1)}
          className="absolute left-5 top-6 text-[#0A0A0A] p-2 -m-2 min-h-[48px] min-w-[48px] flex items-center justify-center"
          aria-label="Back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <div className="flex-1 flex flex-col px-5 pt-8 pb-8" key={currentStep}>
        <h2 className="text-[#0A0A0A] font-bold text-2xl text-center animate-fade-in-up">{q.question}</h2>

        {isChoice && (
          <div className="mt-8 flex flex-col gap-3 animate-fade-in-up opacity-0 animate-fill-forwards animate-delay-100">
            {q.options!.map((opt, i) => (
              <button
                key={opt}
                type="button"
                onClick={() => selectOption(opt)}
                className={`w-full min-h-[48px] rounded-2xl border-2 px-4 py-3 text-left text-base font-medium transition-all duration-200 ${
                  answers[q.id] === opt
                    ? 'border-[#C9A84C] bg-[#C9A84C] text-white'
                    : 'border-[#0A0A0A] bg-transparent text-[#0A0A0A]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {isHeight && (
          <div className="mt-8 flex flex-col gap-4 animate-fade-in-up opacity-0 animate-fill-forwards animate-delay-100">
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={heightValue}
                onChange={(e) => setHeightValue(e.target.value)}
                placeholder={heightUnit === 'cm' ? 'e.g. 175' : 'e.g. 5 9'}
                className="flex-1 min-h-[48px] rounded-2xl border-2 border-[#0A0A0A] px-4 text-base text-[#0A0A0A] placeholder:text-[#6B7280]"
              />
              <button
                type="button"
                onClick={() => setHeightUnit((u) => (u === 'cm' ? 'ft' : 'cm'))}
                className="min-h-[48px] px-4 rounded-2xl border-2 border-[#0A0A0A] text-base text-[#0A0A0A] font-medium"
              >
                {heightUnit === 'cm' ? 'cm' : 'ft·in'}
              </button>
            </div>
          </div>
        )}

        {isWeight && (
          <div className="mt-8 flex flex-col gap-4 animate-fade-in-up opacity-0 animate-fill-forwards animate-delay-100">
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={weightValue}
                onChange={(e) => setWeightValue(e.target.value)}
                placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'}
                className="flex-1 min-h-[48px] rounded-2xl border-2 border-[#0A0A0A] px-4 text-base text-[#0A0A0A] placeholder:text-[#6B7280]"
              />
              <button
                type="button"
                onClick={() => setWeightUnit((u) => (u === 'kg' ? 'lbs' : 'kg'))}
                className="min-h-[48px] px-4 rounded-2xl border-2 border-[#0A0A0A] text-base text-[#0A0A0A] font-medium"
              >
                {weightUnit === 'kg' ? 'kg' : 'lbs'}
              </button>
            </div>
          </div>
        )}

        {hasSelection && (
          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="mt-auto pt-8 w-full min-h-[48px] flex items-center justify-center bg-[#C9A84C] text-[#0A0A0A] font-bold text-base rounded-2xl hover:opacity-95 active:scale-[0.98] transition-all duration-200 animate-fade-in opacity-0 animate-fill-forwards animate-delay-150"
          >
            {loading ? 'Saving…' : currentStep === TOTAL - 1 ? 'See my protocol' : 'Next'}
          </button>
        )}
      </div>
    </main>
  )
}
