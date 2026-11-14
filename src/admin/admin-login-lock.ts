const STORAGE_KEY = 'portfolio-admin-login-lock'
export const MAX_LOGIN_ATTEMPTS = 3
export const LOCKOUT_MS = 2 * 60 * 1000

type LockState = {
  fails: number
  lockedUntil: number
}

function readState(): LockState {
  if (typeof window === 'undefined') return { fails: 0, lockedUntil: 0 }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { fails: 0, lockedUntil: 0 }
    const parsed = JSON.parse(raw) as Partial<LockState>
    return {
      fails: typeof parsed.fails === 'number' ? parsed.fails : 0,
      lockedUntil: typeof parsed.lockedUntil === 'number' ? parsed.lockedUntil : 0,
    }
  } catch {
    return { fails: 0, lockedUntil: 0 }
  }
}

function writeState(state: LockState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage bloqueado
  }
}

export function getLockRemainingMs(now = Date.now()) {
  const { lockedUntil } = readState()
  return Math.max(0, lockedUntil - now)
}

export function isLoginLocked(now = Date.now()) {
  return getLockRemainingMs(now) > 0
}

export function registerLoginFailure(now = Date.now()) {
  const state = readState()
  if (state.lockedUntil > now) return state

  const fails = state.fails + 1
  const next: LockState =
    fails >= MAX_LOGIN_ATTEMPTS
      ? { fails: 0, lockedUntil: now + LOCKOUT_MS }
      : { fails, lockedUntil: 0 }

  writeState(next)
  return next
}

export function clearLoginLock() {
  writeState({ fails: 0, lockedUntil: 0 })
}

export function formatLockCountdown(ms: number) {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${String(sec).padStart(2, '0')}`
}
