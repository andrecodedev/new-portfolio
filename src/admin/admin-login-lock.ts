import { supabase } from '../lib/supabase-client'

export const MAX_LOGIN_ATTEMPTS = 3

export type LoginLockStatus = {
  fails: number
  remainingMs: number
  locked: boolean
}

type RpcStatus = {
  fails?: number
  remaining_ms?: number
  locked?: boolean
}

function normalize(data: unknown): LoginLockStatus {
  const row = (data ?? {}) as RpcStatus
  const remainingMs =
    typeof row.remaining_ms === 'number' && Number.isFinite(row.remaining_ms)
      ? Math.max(0, Math.floor(row.remaining_ms))
      : 0
  return {
    fails: typeof row.fails === 'number' ? row.fails : 0,
    remainingMs,
    locked: Boolean(row.locked) || remainingMs > 0,
  }
}

export async function fetchLoginLockStatus(email: string): Promise<LoginLockStatus> {
  if (!supabase || !email.trim()) {
    return { fails: 0, remainingMs: 0, locked: false }
  }

  const { data, error } = await supabase.rpc('admin_login_status', {
    p_email: email.trim(),
  })

  if (error) {
    return { fails: 0, remainingMs: 0, locked: false }
  }

  return normalize(data)
}

export async function registerLoginFailure(email: string): Promise<LoginLockStatus> {
  if (!supabase || !email.trim()) {
    return { fails: 0, remainingMs: 0, locked: false }
  }

  const { data, error } = await supabase.rpc('admin_login_fail', {
    p_email: email.trim(),
  })

  if (error) {
    return { fails: 0, remainingMs: 0, locked: false }
  }

  return normalize(data)
}

export async function clearLoginLock(email: string) {
  if (!supabase || !email.trim()) return
  await supabase.rpc('admin_login_clear', { p_email: email.trim() })
}

export function formatLockCountdown(ms: number) {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${String(sec).padStart(2, '0')}`
}
