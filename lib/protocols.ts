export type GoalKey =
  | 'Recovery'
  | 'Anti-ageing'
  | 'Lose body fat'
  | 'Energy'
  | 'Sleep'
  | 'General health'

export const PROTOCOL_MAP: Record<GoalKey, string> = {
  Recovery: 'bpc157',
  'Anti-ageing': 'ghk-cu',
  'Lose body fat': 'aod9604',
  Energy: 'cjc-ipamorelin',
  Sleep: 'sermorelin',
  'General health': 'bpc157',
}

export interface ProtocolTemplate {
  compound: string
  content: (firstName: string) => string
}

export const protocols: Record<string, ProtocolTemplate> = {
  bpc157: {
    compound: 'BPC-157',
    content: (firstName) =>
      `Based on what you told me ${firstName}, here's exactly what I'd put you on and why.

You're focused on recovery — whether that's joints, tissue, or getting back to full capacity faster. BPC-157 is a peptide that supports healing and repair where it matters.

**The Compound:** BPC-157

**Why this for you:** It's one of the most researched peptides for accelerating recovery. It supports tendon and ligament repair, gut lining health, and overall tissue healing. For anyone dealing with joint niggles, slow recovery between sessions, or wanting to bounce back faster, it's a strong first choice.

**Dose:** 250–500 mcg per day, typically split into one or two injections.

**How to take it:** Subcutaneous (under the skin, e.g. belly or thigh) or intramuscular near the area of concern if you're comfortable with that. Subcutaneous is simpler and still very effective.

**When:** Morning or post-training. Consistency matters more than the exact time.

**Cycle length:** 12 weeks. Many people notice improvements in recovery and comfort within the first few weeks; full benefits tend to build over the cycle.

**What to expect:** Better recovery between workouts, reduced discomfort in problem areas, and a general sense of your body holding up better. Give it a few weeks to really assess.

**Notes:** Can be stacked with other peptides later if you add goals (e.g. sleep or energy). Stay hydrated and keep your training and nutrition in check — the peptide supports the work you're already doing.

Stick with it, ${firstName}. You've got a protocol that's built for recovery — use it consistently and give your body the run it deserves.`,
  },

  'ghk-cu': {
    compound: 'GHK-Cu',
    content: (firstName) =>
      `Based on what you told me ${firstName}, here's exactly what I'd put you on and why.

You're focused on anti-ageing — skin, collagen, and cellular repair. GHK-Cu is a copper peptide that supports exactly that: firmer skin, better wound healing, and a more resilient system at the cellular level.

**The Compound:** GHK-Cu

**Why this for you:** It promotes collagen and elastin synthesis, supports skin repair, and has been studied for its role in tissue remodelling and antioxidant effects. If you're serious about skin quality and long-term cellular health, it's a targeted choice.

**Dose:** 1–2 mg per day.

**How to take it:** Subcutaneous injection (e.g. belly or thigh). A topical option also exists as a secondary route — some use both for skin-focused results.

**When:** Morning. Keeps timing simple and consistent.

**Cycle length:** 8 weeks. Skin and collagen changes are gradual; 8 weeks gives a good window to evaluate.

**What to expect:** Improved skin texture and elasticity over time, better healing of small nicks or irritation, and a general sense of your skin and connective tissue being better supported. Be patient — this is a marathon, not a sprint.

**Notes:** Pair with good skincare and sun protection. No need to stack with other peptides for this goal unless you add a different objective later.

You're investing in the long game, ${firstName}. This protocol is built for that.`,
  },

  aod9604: {
    compound: 'AOD-9604',
    content: (firstName) =>
      `Based on what you told me ${firstName}, here's exactly what I'd put you on and why.

You're focused on body composition and fat loss. AOD-9604 is a fragment of growth hormone that targets fat metabolism without the blood sugar impact of full HGH — so you get support where you want it, without that downside.

**The Compound:** AOD-9604

**Why this for you:** It supports lipolysis (fat breakdown) and is often used by people who want a little extra edge on stubborn fat while keeping diet and training as the main drivers. It doesn't mess with insulin the way full HGH can, so it's a cleaner option for many.

**Dose:** 300 mcg per day.

**How to take it:** Subcutaneous injection, typically in the morning.

**When:** Fasted, in the morning. That timing aligns well with natural fat oxidation and keeps the routine simple.

**Cycle length:** 12 weeks. Body composition changes take time; 12 weeks gives a fair run to see and feel the difference.

**What to expect:** Gradual improvements in body composition when combined with good nutrition and training. You may notice better definition and a slightly easier time leaning out. It's a support tool, not a magic bullet — your habits still lead.

**Notes:** No need to stack with other peptides for this goal unless you later add sleep or recovery. Keep protein high and training consistent.

You've got a clear goal and a protocol that matches it, ${firstName}. Use it consistently and let the results stack up.`,
  },

  'cjc-ipamorelin': {
    compound: 'CJC-1295 + Ipamorelin',
    content: (firstName) =>
      `Based on what you told me ${firstName}, here's exactly what I'd put you on and why.

You're focused on energy and performance. This stack stimulates your body's own growth hormone release in a pulse-like way — better recovery, improved fat metabolism, and often a nice bump in sleep quality as a side benefit.

**The Compound:** CJC-1295 + Ipamorelin

**Why this for you:** CJC-1295 extends the half-life of natural GH release, and Ipamorelin triggers a clean pulse without the same appetite spike some other peptides cause. Together they support energy, body composition, and recovery. Many people also report deeper sleep and better mornings.

**Dose:** CJC-1295: 100 mcg; Ipamorelin: 100–200 mcg per dose.

**How to take it:** Subcutaneous injection. Same syringe is fine — draw one, then the other, inject together.

**When:** Pre-sleep or post-workout. Pre-sleep is popular because it aligns with your natural GH surge at night and can improve sleep quality.

**Cycle length:** 12 weeks. Benefits build over time — energy, recovery, and body comp tend to improve gradually.

**What to expect:** Better energy and recovery, possible improvements in sleep, and over time a leaner look if your diet and training are in check. Give it a few weeks to notice the full picture.

**Notes:** Avoid eating heavily right before the dose if you're doing pre-sleep; a small window of fasting can help the pulse. This stack is often run alone before adding anything else.

You're set up for energy and performance, ${firstName}. Stay consistent and let the protocol do its job.`,
  },

  sermorelin: {
    compound: 'Sermorelin',
    content: (firstName) =>
      `Based on what you told me ${firstName}, here's exactly what I'd put you on and why.

You're focused on sleep and hormonal support. Sermorelin is a GHRH analogue that encourages your body to produce more of its own growth hormone — which supports deep sleep, recovery, and a gradual restoration of a more youthful GH profile.

**The Compound:** Sermorelin

**Why this for you:** It's well suited to people who want better sleep and recovery without the sharper peaks of some other peptides. Effects are gradual and cumulative: deeper sleep, better recovery, and over time a feeling of being more restored. It's a gentle but effective option.

**Dose:** 200–300 mcg per dose.

**How to take it:** Subcutaneous injection (e.g. belly or thigh).

**When:** Pre-sleep. Taking it in the evening supports your natural night-time GH release and can improve sleep quality.

**Cycle length:** 6 months. Sermorelin rewards patience. Many protocols run 3–6 months to see the full benefits on sleep and recovery.

**What to expect:** Gradual improvement in sleep depth and quality, better recovery over time, and a general sense of being more rested. Onset is not overnight — give it several weeks to notice the pattern.

**Notes:** Keep a consistent bedtime where you can. This peptide works with your rhythm; good sleep hygiene amplifies the results.

You've chosen a protocol that builds with you, ${firstName}. Stick with it and give your body the rest it deserves.`,
  },
}

export function getProtocolForGoal(goal: string): ProtocolTemplate {
  const key = goal as GoalKey
  const slug = PROTOCOL_MAP[key] ?? PROTOCOL_MAP['General health']
  return protocols[slug] ?? protocols.bpc157
}
