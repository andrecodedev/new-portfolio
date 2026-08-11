/**
 * Raiz de scroll do portfolio: o `.stage__scroll` (não o `window`).
 * O quadrado cinza fica fixo; só o conteúdo interno rola.
 */

let scrollRoot: HTMLElement | null = null

export function setScrollRoot(el: HTMLElement | null) {
  scrollRoot = el
}

export function getScrollRoot() {
  return scrollRoot
}

export function scrollRootToTop(behavior: ScrollBehavior = 'auto') {
  scrollRoot?.scrollTo({ top: 0, left: 0, behavior })
}

export function getScrollRootTop() {
  return scrollRoot?.scrollTop ?? 0
}

export function getScrollRootClientHeight() {
  return scrollRoot?.clientHeight ?? window.innerHeight
}
