import { useRef, useState, type CSSProperties } from 'react'
import { ArrowLeft, CaretRight, FolderSimple } from '@phosphor-icons/react'
import Folder from './Folder'
import { accentGlow } from './ui/accent-glow'
import { useScrollToSectionOnChange } from '../navigation/use-scroll-to-section'
import type { WorkPageCopy } from '../i18n/copy'

type Clients = WorkPageCopy['clients']
type RootFolder = Clients['folders'][number]
type Project = RootFolder['projects'][number]

export type WorkFoldersPath =
  | { level: 'root' }
  | { level: 'projects'; rootIndex: number }
  | { level: 'files'; rootIndex: number; projectIndex: number }

type Path = WorkFoldersPath

type ClientsFoldersProps = {
  clients: Clients
  isMobile: boolean
  /** Opcional: controla a navegação por fora (ex.: "Ferramentas de atuação" abre a pasta de um projeto). */
  path?: WorkFoldersPath
  onPathChange?: (next: WorkFoldersPath) => void
}

/** Arquivo com o mesmo desenho dos arquivos que aparecem ao abrir a pasta do projeto. */
function MiniPaper() {
  return (
    <span className="mini-folder__paper folder-doc">
      <span className="folder-doc-heading" />
      <span className="folder-doc-line" style={{ width: '92%' }} />
      <span className="folder-doc-line" style={{ width: '84%' }} />
      <span className="mini-folder__bar" aria-hidden>
        <i />
      </span>
      <span className="mini-folder__fold" aria-hidden />
    </span>
  )
}

/** Mini pasta: dentro das pastas de cliente (trabalho) e na grade de cursos (estudos). */
export function MiniFolder({
  label,
  meta,
  color,
  variant,
}: {
  label: string
  /** Linha pequena embaixo do nome (ex.: quantidade de arquivos). */
  meta?: string
  color: string
  variant: 'peek' | 'open' | 'rest'
}) {
  // Raio em px + data-folder-radii: o vidro lê o atributo (CSS %/calc saía com quina reta).
  const r = 5
  // Cada mini-pasta tem o brilho num canto e ângulo próprios, fixos para a mesma cor e nome.
  const glow = accentGlow(`${color}|${label}`)
  return (
    <div
      className={`mini-folder mini-folder--${variant}`}
      style={
        {
          '--mini-color': color,
          '--mini-radius': `${r}px`,
          '--mini-angle': `${glow.angle}deg`,
          '--mini-reach': `${Math.round(glow.reach * 100)}%`,
          '--mini-alpha': `${Math.round(glow.alpha * 100)}%`,
        } as CSSProperties
      }
    >
      <span
        className="mini-folder__tab"
        aria-hidden
        data-folder-radii={`${r},0,0,0`}
        style={{ borderRadius: `${r}px 0 0 0` }}
      />
      <span
        className="mini-folder__back"
        aria-hidden
        data-folder-radii={`0,${r},${r},${r}`}
        style={{ borderRadius: `0 ${r}px ${r}px ${r}px` }}
      />
      <span className="mini-folder__papers" aria-hidden>
        <MiniPaper />
        <MiniPaper />
        <MiniPaper />
      </span>
      <span
        className="mini-folder__front"
        data-folder-radii={`${r},${r},${r},${r}`}
        style={{ borderRadius: r }}
      >
        <span className="mini-folder__label">{label}</span>
        {meta && <span className="mini-folder__meta">{meta}</span>}
      </span>
    </div>
  )
}

function projectItems(projects: readonly Project[], variant: 'peek' | 'open', filesLabel: string) {
  return projects.map((project) => ({
    content: (
      <MiniFolder
        label={project.label}
        meta={`${project.items.length} ${filesLabel}`}
        color={project.color}
        variant={variant}
      />
    ),
    bare: true,
  }))
}

export function ClientsFolders({ clients, isMobile, path: controlled, onPathChange }: ClientsFoldersProps) {
  const [inner, setInner] = useState<Path>({ level: 'root' })
  const path = controlled ?? inner
  const setPath = onPathChange ?? setInner
  const shellRef = useRef<HTMLDivElement>(null)
  // Ao entrar numa pasta o conteúdo muda de altura (duas pastas viram uma). Travar a altura
  // evita o documento encolher e a página "pular" de posição enquanto o usuário olha.
  const [lockH, setLockH] = useState<number | null>(null)
  const go = (next: Path) => {
    if (next.level === 'root') setLockH(null)
    else if (path.level === 'root' && shellRef.current && !isMobile) setLockH(shellRef.current.offsetHeight)
    setPath(next)
  }
  useScrollToSectionOnChange(shellRef, JSON.stringify(path))
  const size = isMobile ? 0.9 : 1.35

  const rootFolder: RootFolder | null =
    path.level !== 'root' ? clients.folders[path.rootIndex] ?? null : null
  const project: Project | null =
    path.level === 'files' && rootFolder
      ? rootFolder.projects[path.projectIndex] ?? null
      : null

  const goBack = () => {
    if (path.level === 'files') {
      go({ level: 'projects', rootIndex: path.rootIndex })
      return
    }
    if (path.level === 'projects') go({ level: 'root' })
  }

  return (
    <div
      ref={shellRef}
      className="showcase-folders-shell"
      data-locked={lockH ? '' : undefined}
      style={lockH ? { minHeight: lockH } : undefined}
    >
      {path.level !== 'root' && (
        <nav className="folders-path" aria-label={clients.heading}>
          <button
            type="button"
            className="folders-path__back"
            onClick={goBack}
            aria-label={clients.back}
            title={clients.back}
          >
            <ArrowLeft weight="bold" aria-hidden />
          </button>
          <ol className="folders-path__trail">
            <li>
              <button
                type="button"
                className="folders-path__crumb folders-path__crumb--home"
                onClick={() => go({ level: 'root' })}
                aria-label={clients.heading}
                title={clients.heading}
              >
                <FolderSimple weight="fill" aria-hidden />
              </button>
            </li>
            {rootFolder && (
              <li>
                <CaretRight className="folders-path__sep" weight="bold" aria-hidden />
                {project ? (
                  <button
                    type="button"
                    className="folders-path__crumb"
                    onClick={() => go({ level: 'projects', rootIndex: path.rootIndex })}
                  >
                    {rootFolder.label}
                  </button>
                ) : (
                  <span className="folders-path__crumb" aria-current="page" data-current="">
                    {rootFolder.label}
                  </span>
                )}
              </li>
            )}
            {project && (
              <li>
                <CaretRight className="folders-path__sep" weight="bold" aria-hidden />
                <span className="folders-path__crumb" aria-current="page" data-current="">
                  {project.label}
                </span>
              </li>
            )}
          </ol>
        </nav>
      )}

      <div
        className="showcase-folders"
        key={`${path.level}-${'rootIndex' in path ? path.rootIndex : 'r'}-${'projectIndex' in path ? path.projectIndex : 'p'}`}
      >
        {path.level === 'root' &&
          clients.folders.map((folder, rootIndex) => (
            <div className="showcase-folder" key={folder.label}>
              <Folder
                label={folder.label}
                meta={`${folder.projects.length} ${clients.projectsLabel}`}
                mode="flap"
                variant="glass"
                frost={0.12}
                layout="spread"
                color={folder.color}
                paperColor="#ffffff"
                tabPosition="right"
                openOn="click"
                size={size}
                tilt={0.5}
                speed={1}
                bounce={0.4}
                peek
                intro
                theme="dark"
                items={projectItems(folder.projects, 'peek', clients.filesLabel)}
                // Projeto puxado para fora da pasta e clicado: abre direto, sem passar pela pasta do cliente.
                zoomOnClick={false}
                onItemClick={(_item, index) => go({ level: 'files', rootIndex, projectIndex: index })}
                onOpenChange={(open) => {
                  if (open) go({ level: 'projects', rootIndex })
                }}
              />
            </div>
          ))}

        {path.level === 'projects' && rootFolder && (
          <div className="showcase-folder showcase-folder--focus">
            <Folder
              label={rootFolder.label}
              meta={`${rootFolder.projects.length} ${clients.projectsLabel}`}
              mode="flap"
              variant="glass"
              frost={0.12}
              layout="spread"
              color={rootFolder.color}
              paperColor="#ffffff"
              tabPosition="right"
              openOn="click"
              defaultOpen
              size={isMobile ? 0.9 : 1.35}
              spread={isMobile ? 1.35 : undefined}
              tilt={0.5}
              speed={1}
              bounce={0.4}
              peek
              intro
              draggable
              theme="dark"
              items={projectItems(rootFolder.projects, 'open', clients.filesLabel)}
              onItemClick={(_item, index) => {
                go({
                  level: 'files',
                  rootIndex: path.rootIndex,
                  projectIndex: index,
                })
              }}
            />
          </div>
        )}

        {path.level === 'files' && project && (
          <div className="showcase-folder showcase-folder--focus">
            <Folder
              label={project.label}
              meta={`${project.items.length} ${clients.filesLabel}`}
              mode="flap"
              variant="glass"
              frost={0.12}
              layout="spread"
              color={project.color}
              paperColor="#ffffff"
              tabPosition="right"
              openOn="click"
              defaultOpen
              size={isMobile ? 0.9 : 1.35}
              spread={isMobile ? 1.35 : undefined}
              tilt={0.5}
              speed={1}
              bounce={0.4}
              peek
              intro
              draggable
              zoomOnClick
              theme="dark"
              items={project.items.map((item) => ({
                title: item.title,
                description: item.subtitle,
              }))}
            />
          </div>
        )}
      </div>
    </div>
  )
}
