/**
 * Trava o scroll sem remover o “vão” da scrollbar (evita empurrão lateral).
 * Ref-count: boot / menu / transition podem sobrepor.
 */
let lockCount = 0

export function lockPageScroll() {
  lockCount += 1
  document.documentElement.classList.add('is-scroll-locked')
}

export function unlockPageScroll() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    document.documentElement.classList.remove('is-scroll-locked')
  }
}

export function forceUnlockPageScroll() {
  lockCount = 0
  document.documentElement.classList.remove('is-scroll-locked')
}
