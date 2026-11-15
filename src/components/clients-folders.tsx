import { useRef, useState, type CSSProperties } from 'react'
import { ArrowLeft, CaretRight, FolderSimple } from '@phosphor-icons/react'
import Folder from './Folder'
import type { WorkPageCopy } from '../i18n/copy'

type Clients = WorkPageCopy['clients']
type RootFolder = Clients['folders'][number]
type Project = RootFolder['projects'][number]

type Path =
  | { level: 'root' }
  | { level: 'projects'; rootIndex: number }
  | { level: 'files'; rootIndex: number; projectIndex: number }

type ClientsFoldersProps = {
  clients: Clients
  isMobile: boolean
}

function hexLuma(hex: string) {
  const raw = hex.replace('#', '')
  if (raw.length !== 6) return 0.5
  const r = Number.parseInt(raw.slice(0, 2), 16)
  const g = Number.parseInt(raw.slice(2, 4), 16)
  const b = Number.parseInt(raw.slice(4, 6), 16)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

/** Arquivo com o mesmo desenho dos arquivos que aparecem ao abrir a pasta do projeto. */
function MiniPaper() {
  return (
    <span className="mini-folder__paper folder-doc">
      <span className="folder-doc-heading" />
      <span className="folder-doc-line" style={{ width: '92%' }} />
      <span className="folder-doc-line" style={{ width: '84%' }} />
      <span className="folder-doc-line" style={{ width: '88%' }} />
      <span className="folder-doc-block" />
    </span>
  )
}

export function MiniFolder({ label, color, variant }: { label: string; color: string; variant: 'peek' | 'open' | 'rest' }) {
  const ink = hexLuma(color) > 0.62 ? 'rgba(20, 16, 8, 0.82)' : 'rgba(255, 255, 255, 0.96)'
  return (
    <div className={`mini-folder mini-folder--${variant}`} style={{ '--mini-color': color, '--mini-ink': ink } as CSSProperties}>
      <span className="mini-folder__tab" aria-hidden />
      <span className="mini-folder__back" aria-hidden />
      <span className="mini-folder__papers" aria-hidden>
        <MiniPaper />
        <MiniPaper />
        <MiniPaper />
      </span>
      <span className="mini-folder__front">
        <span className="mini-folder__label">{label}</span>
      </span>
    </div>
  )
}

function projectItems(projects: readonly Project[], variant: 'peek' | 'open') {
  return projects.map((project) => ({
    content: <MiniFolder label={project.label} color={project.color} variant={variant} />,
    bare: true,
  }))
}

export function ClientsFolders({ clients, isMobile }: ClientsFoldersProps) {
  const [path, setPath] = useState<Path>({ level: 'root' })
  const shellRef = useRef<HTMLDivElement>(null)
  // Ao entrar numa pasta o conteúdo muda de altura (duas pastas viram uma). Travar a altura
  // evita o documento encolher e a página "pular" de posição enquanto o usuário olha.
  const [lockH, setLockH] = useState<number | null>(null)
  const go = (next: Path) => {
    if (next.level === 'root') setLockH(null)
    else if (path.level === 'root' && shellRef.current && !isMobile) setLockH(shellRef.current.offsetHeight)
    setPath(next)
  }
  const size = isMobile ? 0.8 : 1.2

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
                mode="flap"
                variant="solid"
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
                items={projectItems(folder.projects, 'peek')}
                onOpenChange={(open) => {
                  if (open) go({ level: 'projects', rootIndex })
                }}
              />
              <p className="folder-caption">
                <span className="folder-caption__name">{folder.label}</span>
              </p>
            </div>
          ))}

        {path.level === 'projects' && rootFolder && (
          <div className="showcase-folder showcase-folder--focus">
            <Folder
              label={rootFolder.label}
              mode="flap"
              variant="solid"
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
              items={projectItems(rootFolder.projects, 'open')}
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
              mode="flap"
              variant="solid"
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
