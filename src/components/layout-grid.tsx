import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from '@phosphor-icons/react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { ExperienceEntry } from '../i18n/copy'
import { lockPageScroll, unlockPageScroll } from '../navigation/scroll-lock'
import './layout-grid.css'

type LayoutGridProps = {
  items: readonly ExperienceEntry[]
}

function cardId(item: ExperienceEntry) {
  return `${item.company}-${item.title}`
}

/**
 * Grid de logos. Clique abre um modal com os dados da experiência.
 * O modal só faz fade + subida curta: a versão antiga usava layout compartilhado
 * (layoutId) e o card/logo distorciam durante a transição.
 */
export function LayoutGrid({ items }: LayoutGridProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const reduce = Boolean(useReducedMotion())
  const item = selected !== null ? items[selected] : null

  useEffect(() => {
    if (selected === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    // Com o modal aberto a página não rola (evita o fundo mexendo atrás).
    lockPageScroll()
    return () => {
      window.removeEventListener('keydown', onKey)
      unlockPageScroll()
    }
  }, [selected])

  return (
    <>
      <div className="layout-grid">
        {items.map((entry, index) => (
          <button
            key={cardId(entry)}
            type="button"
            className="layout-grid__cell"
            onClick={() => setSelected(index)}
            aria-label={entry.company}
          >
            <img className="layout-grid__logo" src={entry.logo} alt="" draggable={false} />
            <span className="layout-grid__name">{entry.company}</span>
          </button>
        ))}
      </div>

      {/* Portal no body: dentro da página, as seções vizinhas (cada uma com z-index próprio)
          pintavam por cima do modal. */}
      {createPortal(
      <AnimatePresence>
        {item ? (
          <>
            <motion.button
              key="backdrop"
              type="button"
              className="layout-grid__backdrop"
              aria-label="Fechar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelected(null)}
            />
            <div key="layer" className="layout-grid__modal-layer" data-accent="about">
              <motion.article
                key={cardId(item)}
                className="layout-grid__modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="layout-grid-title"
                initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  type="button"
                  className="layout-grid__close"
                  aria-label="Fechar"
                  onClick={() => setSelected(null)}
                >
                  <X weight="bold" aria-hidden />
                </button>
                <header className="layout-grid__modal-head">
                  <img className="layout-grid__modal-logo" src={item.logo} alt="" draggable={false} />
                  <div className="layout-grid__modal-body">
                    <h3 className="about-experience__title" id="layout-grid-title">
                      {item.title}
                    </h3>
                    <p className="about-experience__meta">
                      {item.company} · {item.position}
                    </p>
                    <p className="about-experience__period">
                      <span>
                        {item.startDate} - {item.endDate} · {item.time}
                      </span>
                      <span>{item.location}</span>
                    </p>
                  </div>
                </header>
                <p className="about-experience__desc">{item.description}</p>
              </motion.article>
            </div>
          </>
        ) : null}
      </AnimatePresence>,
      document.body,
      )}
    </>
  )
}

export default LayoutGrid
