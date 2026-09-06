import { adminCopy } from './admin-copy'
import { ChevronRightIcon } from './icons'

type AdminView = 'menu' | 'hero' | 'gate'

type SidebarMenuProps = {
  onOpenHero: () => void
  onOpenGate: () => void
}

export default function SidebarMenu({ onOpenHero, onOpenGate }: SidebarMenuProps) {
  const copy = adminCopy.dashboard

  return (
    <div>
      <h2 className="admin__title" style={{ fontSize: '1.1rem', marginBottom: 18 }}>
        {copy.modules}
      </h2>
      <div className="admin__modules">
        <button className="admin__module" type="button" onClick={onOpenHero}>
          <span>
            <h3>{copy.heroTitle}</h3>
            <p>{copy.heroDesc}</p>
          </span>
          <ChevronRightIcon />
        </button>
        <button className="admin__module" type="button" onClick={onOpenGate}>
          <span>
            <h3>{copy.gateTitle}</h3>
            <p>{copy.gateDesc}</p>
          </span>
          <ChevronRightIcon />
        </button>
        <button className="admin__module" type="button" disabled>
          <span>
            <h3>
              {copy.workTitle}
              <span className="admin__badge">{copy.soon}</span>
            </h3>
            <p>{copy.workDesc}</p>
          </span>
        </button>
      </div>
    </div>
  )
}

export type { AdminView }
