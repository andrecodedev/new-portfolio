import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowLeft, CaretRight, Check, FolderSimple, Medal } from '@phosphor-icons/react'
import GlassFolder from './ui/glass-folder-cards'
import { accentGlow } from './ui/accent-glow'
import { useScrollToSectionOnChange } from '../navigation/use-scroll-to-section'
import { MiniFolder } from './clients-folders'
import type { ReadingPageCopy } from '../i18n/copy'
import {
  studyPlatforms,
  type StudyCourse,
  type StudyModule,
  type StudyPlatform,
  type StudyStatus,
} from '../data/studies'

type Labels = ReadingPageCopy['studies']['platforms']

export type StudiesPath = { platform: number | null; course: number | null }
type Path = StudiesPath

type StudiesFoldersProps = {
  labels: Labels
  isMobile: boolean
  /** Opcional: controla a navegação por fora (ex.: o gráfico de habilidades abre um curso). */
  path?: StudiesPath
  onPathChange?: (next: StudiesPath) => void
}

const STATUS_ORDER: readonly StudyStatus[] = ['doing', 'queue', 'done']

type Progressive = { status: StudyStatus; progress?: number }

const percent = (item: Progressive) =>
  item.status === 'done' ? 100 : Math.min(100, Math.max(0, item.progress ?? 0))

const count = (list: readonly Progressive[], status: StudyStatus) =>
  list.filter((item) => item.status === status).length

function metaOf(item: { lessons?: number; hours?: number; period?: string }, labels: Labels) {
  return [
    item.lessons ? `${item.lessons} ${labels.lessons}` : null,
    item.hours ? `${item.hours.toLocaleString()}${labels.hours}` : null,
    item.period ?? null,
  ].filter(Boolean) as string[]
}

function ProgressBar({ item, labels }: { item: Progressive; labels: Labels }) {
  const value = percent(item)
  return (
    <span className="study-progress">
      <span className="study-progress__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
        <span style={{ width: `${value}%` }} />
      </span>
      <span className="study-progress__pct">
        {item.status === 'done' ? (
          <span className="study-progress__done" role="img" aria-label={labels.done}>
            <Check weight="bold" aria-hidden />
          </span>
        ) : (
          `${value}%`
        )}
      </span>
    </span>
  )
}

/** Nível 2: cada curso é uma pasta (com os módulos dentro). */
function CourseFolder({
  course,
  color,
  labels,
  index,
  onOpen,
}: {
  course: StudyCourse
  color: string
  labels: Labels
  index: number
  onOpen: () => void
}) {
  const meta = metaOf(course, labels)
  return (
    <li className="course-folder-wrap" style={{ '--i': index } as CSSProperties}>
      <button type="button" className="course-folder" data-status={course.status} onClick={onOpen}>
        <span className="course-folder__art">
          <MiniFolder label={course.title} color={color} variant="rest" />
        </span>
        {meta.length > 0 && <span className="course-folder__meta">{meta.join(' · ')}</span>}
        <ProgressBar item={course} labels={labels} />
      </button>
    </li>
  )
}

/** Nível 3: módulo dentro da pasta do curso. */
function ModuleCard({ module, labels, index }: { module: StudyModule; labels: Labels; index: number }) {
  const meta = metaOf(module, labels)
  return (
    <li className="study-card-wrap" style={{ '--i': index } as CSSProperties}>
      <div className="study-card" data-status={module.status}>
        <span className="study-card__fold" aria-hidden />
        <span className="study-card__title">{module.title}</span>
        {meta.length > 0 && <span className="study-card__meta">{meta.join(' · ')}</span>}
        <ProgressBar item={module} labels={labels} />
      </div>
    </li>
  )
}

function StatusGroups<T extends Progressive>({
  list,
  labels,
  render,
  className,
}: {
  list: readonly T[]
  labels: Labels
  render: (item: T, index: number) => React.ReactNode
  className: string
}) {
  return (
    <>
      {STATUS_ORDER.map((status) => {
        const items = list.filter((item) => item.status === status)
        if (items.length === 0) return null
        return (
          <section className="study-group" key={status} data-status={status}>
            <h4 className="study-group__title">
              {labels[status]} <span>{items.length}</span>
            </h4>
            <ul className={className}>{items.map((item, index) => render(item, index))}</ul>
          </section>
        )
      })}
    </>
  )
}

function Crumbs({
  labels,
  platform,
  course,
  onGo,
}: {
  labels: Labels
  platform: StudyPlatform
  course: StudyCourse | null
  onGo: (next: Path) => void
}) {
  const trailRef = useRef<HTMLOListElement>(null)
  // Caminho longo: ao entrar num curso o final (nome atual) aparece; o resto fica a um deslize de distância.
  useEffect(() => {
    const trail = trailRef.current
    if (trail) trail.scrollTo({ left: trail.scrollWidth, behavior: 'smooth' })
  }, [platform, course])

  return (
    <nav className="folders-path" aria-label={labels.heading}>
      <button
        type="button"
        className="folders-path__back"
        onClick={() => onGo(course ? { platform: studyPlatforms.indexOf(platform), course: null } : { platform: null, course: null })}
        aria-label={labels.back}
        title={labels.back}
      >
        <ArrowLeft weight="bold" aria-hidden />
      </button>
      <ol className="folders-path__trail" ref={trailRef}>
        <li>
          <button
            type="button"
            className="folders-path__crumb folders-path__crumb--home"
            onClick={() => onGo({ platform: null, course: null })}
            aria-label={labels.heading}
            title={labels.heading}
          >
            <FolderSimple weight="fill" aria-hidden />
          </button>
        </li>
        <li>
          <CaretRight className="folders-path__sep" weight="bold" aria-hidden />
          {course ? (
            <button
              type="button"
              className="folders-path__crumb"
              onClick={() => onGo({ platform: studyPlatforms.indexOf(platform), course: null })}
            >
              {platform.label}
            </button>
          ) : (
            <span className="folders-path__crumb" aria-current="page" data-current="">
              {platform.label}
            </span>
          )}
        </li>
        {course && (
          <li>
            <CaretRight className="folders-path__sep" weight="bold" aria-hidden />
            <span className="folders-path__crumb folders-path__crumb--course" aria-current="page" data-current="">
              {course.title}
            </span>
          </li>
        )}
      </ol>
    </nav>
  )
}

/** Pasta cinza com um brilho diagonal da cor da plataforma (canto e ângulo próprios, sempre os mesmos). */
function glowStyle(color: string, label: string): CSSProperties {
  const glow = accentGlow(`${color}|${label}`)
  return {
    '--gf-accent': color,
    '--gf-glow-angle': `${glow.angle}deg`,
    '--gf-glow-reach': `${Math.round(glow.reach * 100)}%`,
    '--gf-glow-alpha': `${Math.round(glow.alpha * 100)}%`,
  } as CSSProperties
}

export function StudiesFolders({ labels, isMobile, path: controlled, onPathChange }: StudiesFoldersProps) {
  const [inner, setInner] = useState<Path>({ platform: null, course: null })
  const path = controlled ?? inner
  const setPath = onPathChange ?? setInner
  const shellRef = useRef<HTMLDivElement>(null)
  const [lockH, setLockH] = useState<number | null>(null)

  const go = (next: Path) => {
    if (next.platform === null) setLockH(null)
    else if (path.platform === null && shellRef.current && !isMobile) setLockH(shellRef.current.offsetHeight)
    setPath(next)
  }

  useScrollToSectionOnChange(shellRef, `${path.platform}-${path.course}`)

  const platform = path.platform !== null ? studyPlatforms[path.platform] : null
  const course = platform && path.course !== null ? platform.courses[path.course] : null
  const width = isMobile ? 220 : 300

  return (
    <div
      ref={shellRef}
      className="showcase-folders-shell"
      data-locked={lockH ? '' : undefined}
      style={lockH ? { minHeight: lockH } : undefined}
    >
      {platform && <Crumbs labels={labels} platform={platform} course={course} onGo={go} />}

      {/* Nível 1: pastas das plataformas */}
      {!platform && (
        <div className="showcase-folders study-folders" key="root">
          {studyPlatforms.map((item, index) => (
            <div className="showcase-folder study-folder" key={item.id}>
              <GlassFolder
                label={item.label}
                meta={`${item.courses.length} ${labels.courses}`}
                tone="dark"
                art="none"
                style={glowStyle(item.color, item.label)}
                action="none"
                labelPlacement="bottom-left"
                width={width}
                appearDelay={index * 120}
                files={item.courses.slice(0, 4).map((entry) => ({
                  name: entry.title,
                  meta: entry.status === 'done' ? '100%' : entry.progress != null ? `${entry.progress}%` : undefined,
                  // Mesmo desenho das mini pastas de trabalho (pasta dentro de pasta).
                  content: <MiniFolder label={entry.title} color={item.color} variant="rest" />,
                }))}
                onOpenChange={(open) => {
                  if (open) go({ platform: index, course: null })
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Nível 2: pastas dos cursos da plataforma */}
      {platform && !course && (
        <div className="study-panel" key={platform.id} style={{ '--platform': platform.color } as CSSProperties}>
          <header className="study-panel__head">
            {platform.logo ? (
              <img className="study-panel__logo" src={platform.logo} alt="" />
            ) : (
              <span className="study-panel__logo study-panel__logo--letter" aria-hidden>
                {platform.label.charAt(0)}
              </span>
            )}
            <h3 className="study-panel__name">{platform.label}</h3>
            <ul className="study-panel__stats">
              {STATUS_ORDER.map((status) => {
                const n = count(platform.courses, status)
                return n > 0 ? (
                  <li key={status} data-status={status}>
                    <strong>{n}</strong> {labels[status]}
                  </li>
                ) : null
              })}
            </ul>
          </header>
          <StatusGroups
            list={platform.courses}
            labels={labels}
            className="course-grid"
            render={(item, index) => (
              <CourseFolder
                key={item.title}
                course={item}
                color={platform.color}
                labels={labels}
                index={index}
                onOpen={() => go({ platform: path.platform, course: platform.courses.indexOf(item) })}
              />
            )}
          />
        </div>
      )}

      {/* Nível 3: dentro da pasta do curso (módulos) */}
      {platform && course && (
        <div
          className="study-panel"
          key={`${platform.id}-${course.title}`}
          style={{ '--platform': platform.color } as CSSProperties}
        >
          <header className="study-panel__head study-panel__head--course">
            <div className="study-course">
              <h3 className="study-course__title">{course.title}</h3>
              {metaOf(course, labels).length > 0 && (
                <p className="study-course__meta">{metaOf(course, labels).join(' · ')}</p>
              )}
              <ProgressBar item={course} labels={labels} />
            </div>
            {course.certificateUrl ? (
              <a className="study-course__cert" href={course.certificateUrl} target="_blank" rel="noreferrer">
                <Medal weight="fill" aria-hidden /> {labels.certificate}
              </a>
            ) : (
              <span className="study-course__cert study-course__cert--soon">
                <Medal weight="regular" aria-hidden /> {labels.noCertificate}
              </span>
            )}
          </header>

          {course.modules && course.modules.length > 0 ? (
            <StatusGroups
              list={course.modules}
              labels={labels}
              className="study-grid"
              render={(item, index) => <ModuleCard key={item.title} module={item} labels={labels} index={index} />}
            />
          ) : (
            <p className="study-empty">{labels.emptyModules}</p>
          )}
        </div>
      )}
    </div>
  )
}
