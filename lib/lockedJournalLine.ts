/**
 * One journal line that reflects what they actually answered — no generic filler.
 */
export function journalLineFromAnswers(
  firstName: string,
  goalFallback: string,
  answers: Record<string, string> | null | undefined
): string {
  const a = answers ?? {}
  const goal = (a.goal || goalFallback || 'General health').trim()
  const frustration = a.frustration?.trim()
  const energy = a.energy?.trim()
  const sleep = a.sleep?.trim()
  const describe = a.describe?.trim()
  const name = firstName ? `${firstName}, ` : ''

  const goalLower = goal.charAt(0).toLowerCase() + goal.slice(1)

  if (frustration) {
    return `${name}you want **${goal}** — and you were blunt about **${frustration}** getting in the way. That pairing is literally what we wrote to.`
  }

  if (energy && (energy === 'Low' || energy === 'Very low')) {
    return `${name}you flagged energy as running on empty while chasing **${goalLower}** — we didn’t flatten that into a generic stack; it’s wired in.`
  }

  if (sleep && (sleep === 'Struggle' || sleep === 'Consistently poor')) {
    return `${name}sleep came up rough in your answers, with **${goalLower}** still the north star — we built from both, not from a brochure.`
  }

  if (describe) {
    return `${name}**${describe}** — that’s how you introduced yourself. **${goal}** is what you said you’re after. The protocol follows that, not a default script.`
  }

  return `${name}**${goal}** is what you picked when we asked what actually matters — everything you typed after that steered how this was written.`
}
