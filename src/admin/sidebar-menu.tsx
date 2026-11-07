import { adminCopy } from './admin-copy'
import { ChevronRightIcon } from './icons'

type AdminView =
  | 'menu'
  | 'hero'
  | 'gate'
  | 'header'
  | 'footer'
  | 'chrome'
  | 'design'

type SidebarMenuProps = {
  onOpenHeader: () => void
  onOpenFooter: () => void
  onOpenChrome: () => void
  onOpenDesign: () => void
  onOpenGate: () => void
  onOpenHero: () => void
  headerName?: string
  footerName?: string
  chromeName?: string
  designName?: string
  gateName?: string
}

export default function SidebarMenu({
  onOpenHeader,
  onOpenFooter,
  onOpenChrome,
  onOpenDesign,
  onOpenGate,
  onOpenHero,
  headerName = '',
  footerName = '',
  chromeName = '',
  designName = '',
  gateName = '',
}: SidebarMenuProps) {
  const copy = adminCopy.dashboard

  return (
    <div className="admin__pages">
      <section className="admin__pages-section">
        <div className="admin__pages-head">
          <h2 className="admin__pages-title">{copy.globals}</h2>
          <p className="admin__lead">{copy.globalsLead}</p>
        </div>

        <div className="admin__pages-list">
          <button className="admin__page-card" type="button" onClick={onOpenDesign}>
            <span className="admin__page-card-copy">
              <h3>{designName.trim() || copy.designTitle}</h3>
              <p>{copy.designDesc}</p>
            </span>
            <ChevronRightIcon />
          </button>

          <button className="admin__page-card" type="button" onClick={onOpenHeader}>
            <span className="admin__page-card-copy">
              <h3>{headerName.trim() || copy.headerTitle}</h3>
              <p>{copy.headerDesc}</p>
            </span>
            <ChevronRightIcon />
          </button>

          <button className="admin__page-card" type="button" onClick={onOpenFooter}>
            <span className="admin__page-card-copy">
              <h3>{footerName.trim() || copy.footerTitle}</h3>
              <p>{copy.footerDesc}</p>
            </span>
            <ChevronRightIcon />
          </button>

          <button className="admin__page-card" type="button" onClick={onOpenChrome}>
            <span className="admin__page-card-copy">
              <h3>{chromeName.trim() || copy.chromeTitle}</h3>
              <p>{copy.chromeDesc}</p>
            </span>
            <ChevronRightIcon />
          </button>

          <button className="admin__page-card" type="button" onClick={onOpenGate}>
            <span className="admin__page-card-copy">
              <h3>{gateName.trim() || copy.gateTitle}</h3>
              <p>{copy.gateDesc}</p>
            </span>
            <ChevronRightIcon />
          </button>
        </div>
      </section>

      <section className="admin__pages-section">
        <div className="admin__pages-head">
          <h2 className="admin__pages-title">{copy.modules}</h2>
          <p className="admin__lead">{copy.subtitle}</p>
        </div>

        <div className="admin__pages-list">
          <button className="admin__page-card" type="button" onClick={onOpenHero}>
            <span className="admin__page-card-copy">
              <h3>{copy.heroTitle}</h3>
              <p>{copy.heroDesc}</p>
            </span>
            <ChevronRightIcon />
          </button>

          <button className="admin__page-card" type="button" disabled>
            <span className="admin__page-card-copy">
              <h3>
                {copy.workTitle}
                <span className="admin__badge">{copy.soon}</span>
              </h3>
              <p>{copy.workDesc}</p>
            </span>
          </button>
        </div>
      </section>
    </div>
  )
}

export type { AdminView }
