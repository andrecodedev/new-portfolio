/**
 * Trava o scroll do `.stage__scroll` (ref-count: boot / menu / transition).
 */
import { getScrollRoot } from './scroll-root'

let lockCount = 0

const LOCK_CLASS = 'is-scroll-locked'

export function lockPageScroll() {
  lockCount += 1
  document.documentElement.classList.add(LOCK_CLASS)
  getScrollRoot()?.classList.add(LOCK_CLASS)
}

export function unlockPageScroll() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    document.documentElement.classList.remove(LOCK_CLASS)
    getScrollRoot()?.classList.remove(LOCK_CLASS)
  }
}

export function forceUnlockPageScroll() {
  lockCount = 0
  document.documentElement.classList.remove(LOCK_CLASS)
  getScrollRoot()?.classList.remove(LOCK_CLASS)
}
