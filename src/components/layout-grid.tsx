import { useEffect, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { X } from '@phosphor-icons/react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { ExperienceEntry } from '../i18n/copy'
import { lockPageScroll, unlockPageScroll } from '../navigation/scroll-lock'
import './layout-grid.css'

type LayoutGridProps = {
  items: readonly ExperienceEntry[]
  /** Cor de destaque da página (o modal fica no body e não herda do contêiner). */
  accent?: string
}

function cardId(item: ExperienceEntry) {
  return `${item.company}-${item.title}`
}

/**
 * Grid de logos. Clique abre um modal com os dados da experiência.
 * O modal nasce do centro do card clicado e volta para ele ao fechar. É só translate + escala
 * uniforme (sem layoutId): a versão antiga com layout compartilhado distorcia card e logo.
 */
export function LayoutGrid({ items, accent = 'about' }: LayoutGridProps) {
  const [selected, setSelected] = useState<number | null>(null)
  // Deslocamento (em px) do centro do card clicado até o centro da tela, onde o modal fica.
  const [origin, setOrigin] = useState({ x: 0, y: 0 })
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
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              const box = event.currentTarget.getBoundingClientRect()
              setOrigin({
                x: box.left + box.width / 2 - window.innerWidth / 2,
                y: box.top + box.height / 2 - window.innerHeight / 2,
              })
              setSelected(index)
            }}
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
              transition={{ duration: 0.28, ease: 'easeOut' }}
              onClick={() => setSelected(null)}
            />
            <div key="layer" className="layout-grid__modal-layer" data-accent={accent}>
              <motion.article
                key={cardId(item)}
                className="layout-grid__modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="layout-grid-title"
                initial={reduce ? false : { opacity: 0, x: origin.x * 0.6, y: origin.y * 0.6, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                  scale: 1,
                  transition: { type: 'spring', stiffness: 300, damping: 30, mass: 0.9, opacity: { duration: 0.18 } },
                }}
                exit={
                  reduce
                    ? undefined
                    : {
                        opacity: 0,
                        x: origin.x * 0.6,
                        y: origin.y * 0.6,
                        scale: 0.6,
                        transition: { duration: 0.24, ease: [0.4, 0, 0.8, 0.4] },
                      }
                }
              >
                <button
                  type="button"
                  className="layout-grid__close"
                  aria-label="Fechar"
                  onClick={() => setSelected(null)}
                >
                  <X weight="bold" aria-hidden />
                </button>
                <motion.header
                  className="layout-grid__modal-head"
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.3, ease: 'easeOut' } }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                >
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
                </motion.header>
                <motion.p
                  className="about-experience__desc"
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.17, duration: 0.3, ease: 'easeOut' } }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                >
                  {item.description}
                </motion.p>
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
