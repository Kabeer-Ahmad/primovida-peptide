/**
 * Haptics via the Web Vibration API.
 * Supported on many Android/Chromium browsers. iOS Safari does not expose vibration (calls no-op).
 */

function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern)
    }
  } catch {
    /* ignore */
  }
}

/** Advancing / going back a question */
export function hapticProgress() {
  vibrate(14)
}

/** Tapping an answer option */
export function hapticSelect() {
  vibrate(10)
}

/** Slider tick — throttled so drag doesn’t hammer the motor */
let lastTickAt = 0
const TICK_MS = 48

export function hapticSliderTick() {
  const now = Date.now()
  if (now - lastTickAt < TICK_MS) return
  lastTickAt = now
  vibrate(7)
}
