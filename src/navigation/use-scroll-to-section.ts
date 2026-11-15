import { useEffect, useRef, type RefObject } from 'react'

/**
 * Ao trocar de nível numa navegação de pastas a altura do conteúdo muda; sem isso o scroll fica onde estava
 * (e cai em outra seção, mais embaixo). Quando o topo da seção ficou pra cima da tela, leva o scroll de volta.
 */
export function useScrollToSectionOnChange(ref: RefObject<HTMLElement | null>, key: string) {
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const section = ref.current?.closest('section')
    if (!section) return
    const top = section.getBoundingClientRect().top
    if (top < 64) section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [ref, key])
}
