/** Evita indexação do painel em SPA (além de robots.txt / headers). */
export function applyAdminNoIndex() {
  if (typeof document === 'undefined') return

  let meta = document.querySelector('meta[name="robots"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'robots')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', 'noindex, nofollow')
}
