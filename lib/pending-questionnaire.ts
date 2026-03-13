/** Answers saved after questionnaire, before signup (sessionStorage). */
export const PENDING_QUESTIONNAIRE_KEY = 'primovidal_pending_questionnaire'

export type PendingQuestionnaire = {
  goal: string
  answers: Record<string, string>
}

export function savePendingQuestionnaire(data: PendingQuestionnaire) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(PENDING_QUESTIONNAIRE_KEY, JSON.stringify(data))
  } catch {
    // ignore quota / private mode
  }
}

export function loadPendingQuestionnaire(): PendingQuestionnaire | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(PENDING_QUESTIONNAIRE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as PendingQuestionnaire
    if (!p || typeof p.goal !== 'string' || typeof p.answers !== 'object') return null
    return p
  } catch {
    return null
  }
}

export function clearPendingQuestionnaire() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(PENDING_QUESTIONNAIRE_KEY)
  } catch {
    // ignore
  }
}
