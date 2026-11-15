import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { Check, MagnifyingGlass, X } from '@phosphor-icons/react'
import type { ReadingPageCopy } from '../i18n/copy'
import { matchSkill, skillLevels, type SkillLevel } from '../data/skill-evidence'

type Labels = ReadingPageCopy['studies']['platforms']

type SkillChartProps = {
  labels: Labels
  isMobile: boolean
  onOpenCourse: (platformIndex: number, courseIndex: number) => void
}

const coursePercent = (status: string, progress?: number) =>
  status === 'done' ? 100 : status === 'queue' ? 0 : Math.min(100, Math.max(0, progress ?? 0))

function SkillCard({ skill, selected, index, onSelect }: { skill: SkillLevel; selected: boolean; index: number; onSelect: () => void }) {
  return (
    <li style={{ '--i': index } as CSSProperties}>
      <button type="button" className="sk-card" aria-pressed={selected} data-selected={selected ? '' : undefined} onClick={onSelect}>
        <img className="sk-card__icon" src={skill.icon} alt="" />
        <span className="sk-card__name">{skill.name}</span>
        {skill.percent === null ? (
          <span className="sk-card__tag" />
        ) : (
          <span className="sk-card__pct">{skill.percent}%</span>
        )}
        <span className="sk-card__bar" data-empty={skill.percent === null ? '' : undefined} aria-hidden>
          <span style={{ width: `${skill.percent ?? 0}%` }} />
        </span>
      </button>
    </li>
  )
}

function SkillDetail({ skill, labels, onOpenCourse }: { skill: SkillLevel; labels: Labels; onOpenCourse: SkillChartProps['onOpenCourse'] }) {
  return (
    <aside className="sk-detail" aria-live="polite">
      <header className="sk-detail__head">
        <img className="sk-detail__icon" src={skill.icon} alt="" />
        <div className="sk-detail__title">
          <h3>{skill.name}</h3>
          <p>{labels.skillGroups[skill.group]}</p>
        </div>
        {skill.percent !== null && <strong className="sk-detail__pct">{skill.percent}%</strong>}
      </header>

      {skill.percent !== null && (
        <span className="sk-detail__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={skill.percent} aria-label={skill.name}>
          <span key={skill.name} style={{ width: `${skill.percent}%` }} />
        </span>
      )}

      {skill.evidence.length === 0 ? (
        <p className="sk-detail__note">{labels.chartPracticeNote}</p>
      ) : (
        <>
          <h4 className="sk-detail__sub">
            {labels.chartEvidence} <span>{skill.evidence.length}</span>
          </h4>
          <ul className="sk-evidence">
            {skill.evidence.map((item) => {
              const value = coursePercent(item.course.status, item.course.progress)
              return (
                <li key={`${item.platform.id}-${item.course.title}`}>
                  <button
                    type="button"
                    className="sk-ev"
                    style={{ '--platform': item.platform.color } as CSSProperties}
                    title={labels.chartOpen}
                    onClick={() => onOpenCourse(item.platformIndex, item.courseIndex)}
                  >
                    <span className="sk-ev__top">
                      <span className="sk-ev__platform">{item.platform.label}</span>
                      {item.course.status === 'done' ? (
                        <span className="study-progress__done" role="img" aria-label={labels.done}>
                          <Check weight="bold" aria-hidden />
                        </span>
                      ) : (
                        <span className="sk-ev__pct">{value}%</span>
                      )}
                    </span>
                    <span className="sk-ev__title">{item.course.title}</span>
                    <span className="sk-ev__bar" aria-hidden>
                      <span style={{ width: `${value}%` }} />
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </aside>
  )
}

/**
 * Lista completa de habilidades em cartões, com painel de detalhes ao lado (abaixo, no celular).
 * Selecionar uma habilidade mostra no painel os cursos que a comprovam; nada na grade muda de lugar.
 */
export function SkillChart({ labels, isMobile, onOpenCourse }: SkillChartProps) {
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState(-1)
  const detailRef = useRef<HTMLDivElement>(null)

  const list = useMemo(
    () => skillLevels.filter((skill) => (group < 0 || skill.group === group) && matchSkill(query, skill.name)),
    [query, group],
  )
  const selected = list.find((skill) => skill.name === selectedName) ?? list[0] ?? null
  const chips = [labels.skillAll, ...labels.skillGroups]

  return (
    <div className="skill-chart">
      <p className="skill-chart__subtitle">{labels.chartSubtitle}</p>

      <div className="skill-chart__tools">
        <label className="skill-search">
          <MagnifyingGlass className="skill-search__icon" weight="bold" aria-hidden />
          <input
            type="search"
            className="skill-search__input"
            value={query}
            placeholder={labels.chartSearch}
            aria-label={labels.chartSearch}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => {
              setQuery(event.target.value)
              // Ao buscar, a busca vale pra todas as categorias (senão o resultado some atrás de um filtro).
              if (event.target.value) setGroup(-1)
            }}
          />
          {query && (
            <button type="button" className="skill-search__clear" aria-label="Limpar" onClick={() => setQuery('')}>
              <X weight="bold" aria-hidden />
            </button>
          )}
        </label>
        <div className="skill-chart__chips" role="tablist">
          {chips.map((chip, index) => (
            <button
              key={chip}
              type="button"
              role="tab"
              aria-selected={group === index - 1}
              className="skill-dome__chip"
              data-active={group === index - 1 ? '' : undefined}
              onClick={(event) => {
                setGroup(index - 1)
                // No celular os filtros são um carrossel: o clicado vai pro centro.
                event.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
              }}
            >
              {chip}
            </button>
          ))}
        </div>
        <p className="skill-chart__count">
          {list.length} {labels.chartCount}
        </p>
      </div>

      {list.length === 0 || !selected ? (
        <p className="study-empty">{labels.chartEmpty}</p>
      ) : (
        <div className="sk-layout">
          <ul className="sk-grid">
            {list.map((skill, index) => (
              <SkillCard
                key={skill.name}
                skill={skill}
                index={index}
                selected={skill.name === selected.name}
                onSelect={() => {
                  setSelectedName(skill.name)
                  // No celular o painel fica acima da grade: leva a tela até o título da seção (abaixo do menu fixo).
                  if (isMobile) detailRef.current?.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              />
            ))}
          </ul>
          <div className="sk-detail-wrap" ref={detailRef}>
            <SkillDetail skill={selected} labels={labels} onOpenCourse={onOpenCourse} />
          </div>
        </div>
      )}
    </div>
  )
}
