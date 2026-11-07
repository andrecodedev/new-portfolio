import { useEffect, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import type { ExperienceEntry } from '../i18n/copy'
import './layout-grid.css'

type LayoutGridProps = {
  items: readonly ExperienceEntry[]
}

function cardId(item: ExperienceEntry) {
  return `${item.company}-${item.title}`
}

/**
 * Grid de logos. Clique expande o card (layout compartilhado) com os dados da experiência.
 * Sem Tailwind, sem Next/Image: o projeto já usa framer-motion + CSS próprio.
 */
export function LayoutGrid({ items }: LayoutGridProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const reduce = Boolean(useReducedMotion())
  const item = selected !== null ? items[selected] : null
  const layout = reduce ? undefined : true

  useEffect(() => {
    if (selected === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  return (
    <LayoutGroup>
      <div className="layout-grid">
        {items.map((entry, index) => {
          const id = cardId(entry)
          if (selected === index) {
            return <div key={id} className="layout-grid__cell layout-grid__cell--ghost" aria-hidden />
          }

          return (
            <motion.button
              key={id}
              type="button"
              layoutId={layout ? `exp-card-${id}` : undefined}
              className="layout-grid__cell"
              onClick={() => setSelected(index)}
              aria-label={entry.company}
            >
              <motion.img
                layoutId={layout ? `exp-logo-${id}` : undefined}
                className="layout-grid__logo"
                src={entry.logo}
                alt=""
                draggable={false}
              />
              <span className="layout-grid__name">{entry.company}</span>
            </motion.button>
          )
        })}
      </div>

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
              onClick={() => setSelected(null)}
            />
            <div className="layout-grid__modal-layer">
              <motion.article
                key={cardId(item)}
                layoutId={layout ? `exp-card-${cardId(item)}` : undefined}
                className="layout-grid__modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="layout-grid-title"
              >
                <motion.img
                  layoutId={layout ? `exp-logo-${cardId(item)}` : undefined}
                  className="layout-grid__modal-logo"
                  src={item.logo}
                  alt=""
                  draggable={false}
                />
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
                  <p className="about-experience__desc">{item.description}</p>
                </div>
              </motion.article>
            </div>
          </>
        ) : null}
      </AnimatePresence>
    </LayoutGroup>
  )
}

export default LayoutGrid
