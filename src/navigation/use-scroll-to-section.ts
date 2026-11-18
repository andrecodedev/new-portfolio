import { useEffect, useRef, type RefObject } from 'react'

/**
 * Ao trocar de nível numa navegação de pastas a altura do conteúdo muda; sem isso o scroll fica onde estava
 * (e cai em outra seção, mais embaixo). Quando a seção ficou pra cima da tela, ou está abaixo da metade dela (ex.: o clique veio de outra seção), leva o scroll até ela.
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
    // Fora da faixa confortável (já passou do topo, ou ainda está lá embaixo na tela): leva a seção pro topo.
    if (top < 64 || top > window.innerHeight * 0.5) section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [ref, key])
}
