import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import type { CmsChromePayload } from '../cms/chrome-content'
import {
  designCssVars,
  type CmsDesignPayload,
} from '../cms/design-content'
import type { CmsFooterPayload } from '../cms/footer-content'
import type { CmsGatePayload } from '../cms/gate-content'
import type { CmsHeaderPayload } from '../cms/header-content'
import type { CmsHeroPayload } from '../cms/hero-content'
import { GatePreview } from '../cms/gate-popup'
import type { PreviewDevice } from '../cms/hero-stack'
import type { AdminView } from './sidebar-menu'
import { adminCopy } from './admin-copy'
import { RedoIcon, UndoIcon } from './icons'
import {
  ChromeSitePreview,
  FooterSitePreview,
  HeaderClosedPreview,
  HeaderMenuPreview,
  HomeSitePreview,
} from './site-chrome-preview'

const DESKTOP_PREVIEW_WIDTH = 1240
const MOBILE_PREVIEW_WIDTH = 390

type HeaderPreviewMode = 'bar' | 'menu'

type LivePreviewProps = {
  currentView: AdminView
  previewLang: string
  onPreviewLang: (locale: string) => void
  previewDevice: PreviewDevice
  onPreviewDevice: (device: PreviewDevice) => void
  heroData: CmsHeroPayload
  gateData: CmsGatePayload
  headerData: CmsHeaderPayload
  footerData: CmsFooterPayload
  chromeData: CmsChromePayload
  designData: CmsDesignPayload
  previewModuleId?: string | null
  onSelectEdit?: (id: string) => void
  canUndo?: boolean
  canRedo?: boolean
  onUndo?: () => void
  onRedo?: () => void
}

function PreviewScaler({
  device,
  designData,
  children,
}: {
  device: PreviewDevice
  designData: CmsDesignPayload
  children: ReactNode
}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [canvasHeight, setCanvasHeight] = useState(0)
  const canvasWidth =
    device === 'mobile' ? MOBILE_PREVIEW_WIDTH : DESKTOP_PREVIEW_WIDTH

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const canvas = canvasRef.current
    if (!viewport || !canvas) return

    const update = () => {
      const nextScale = Math.min(1, viewport.clientWidth / canvasWidth)
      setScale(nextScale)
      setCanvasHeight(canvas.scrollHeight)
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(viewport)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [canvasWidth, children])

  return (
    <div
      ref={viewportRef}
      className={`admin-preview-frame admin-preview-frame--${device}`}
    >
      <div
        className="admin-preview-frame__slot"
        style={{
          width: canvasWidth * scale,
          height: Math.max(canvasHeight * scale, 1),
        }}
      >
        <div
          ref={canvasRef}
          className={`admin-preview admin-preview--${device}`}
          style={{
            width: canvasWidth,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            ...designCssVars(designData, device),
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default function LivePreview({
  currentView,
  previewLang,
  onPreviewLang,
  previewDevice,
  onPreviewDevice,
  heroData,
  gateData,
  headerData,
  footerData,
  chromeData,
  designData,
  previewModuleId,
  onSelectEdit,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}: LivePreviewProps) {
  const copy = adminCopy.dashboard
  const [headerMode, setHeaderMode] = useState<HeaderPreviewMode>('bar')

  const isLive = currentView !== 'menu'
  const isNavOrSocial =
    Boolean(previewModuleId) &&
    (headerData.navItems.some((item) => item.id === previewModuleId) ||
      headerData.socials.some((item) => item.id === previewModuleId))

  useEffect(() => {
    if (currentView === 'header' && isNavOrSocial) setHeaderMode('menu')
    if (currentView === 'header' && previewModuleId === 'logo') setHeaderMode('bar')
    if (currentView === 'header' && previewModuleId === 'cta') setHeaderMode('bar')
    if (currentView === 'header' && previewModuleId === 'menu') setHeaderMode('bar')
    if (currentView === 'header' && previewModuleId === 'header') setHeaderMode('bar')
  }, [currentView, isNavOrSocial, previewModuleId])

  const handlePreviewClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!onSelectEdit) return
    const target = (event.target as HTMLElement | null)?.closest?.(
      '[data-cms-edit]',
    ) as HTMLElement | null
    if (!target) return
    const id = target.getAttribute('data-cms-edit')
    if (!id) return
    event.preventDefault()
    event.stopPropagation()
    onSelectEdit(id)
  }

  return (
    <div className={`admin__preview${isLive ? '' : ' admin__preview--idle'}`}>
      <div className="admin__preview-bar">
        <span>{isLive ? copy.previewLive : copy.previewIdle}</span>
        {isLive ? (
          <div className="admin__preview-controls">
            <div className="admin__history">
              <button
                type="button"
                className="admin__history-btn"
                title={copy.undo}
                aria-label={copy.undo}
                disabled={!canUndo}
                onClick={onUndo}
              >
                <UndoIcon />
              </button>
              <button
                type="button"
                className="admin__history-btn"
                title={copy.redo}
                aria-label={copy.redo}
                disabled={!canRedo}
                onClick={onRedo}
              >
                <RedoIcon />
              </button>
            </div>
            {currentView === 'header' ? (
              <div className="admin__langs">
                <button
                  type="button"
                  className={`admin__lang${headerMode === 'bar' ? ' admin__lang--on' : ''}`}
                  onClick={() => setHeaderMode('bar')}
                >
                  {copy.previewHeaderBar}
                </button>
                <button
                  type="button"
                  className={`admin__lang${headerMode === 'menu' ? ' admin__lang--on' : ''}`}
                  onClick={() => setHeaderMode('menu')}
                >
                  {copy.previewHeaderMenu}
                </button>
              </div>
            ) : null}
            <div className="admin__langs">
              {(['desktop', 'mobile'] as const).map((device) => (
                <button
                  key={device}
                  type="button"
                  className={`admin__lang${previewDevice === device ? ' admin__lang--on' : ''}`}
                  onClick={() => onPreviewDevice(device)}
                >
                  {device === 'desktop' ? copy.previewDesktop : copy.previewMobile}
                </button>
              ))}
            </div>
            <div className="admin__langs">
              {(chromeData.locales.filter((item) => item.enabled).length > 0
                ? chromeData.locales.filter((item) => item.enabled)
                : [
                    { code: 'pt', label: 'PT' },
                    { code: 'en', label: 'EN' },
                    { code: 'es', label: 'ES' },
                  ]
              ).map((item) => (
                <button
                  key={item.code}
                  type="button"
                  className={`admin__lang${previewLang === item.code ? ' admin__lang--on' : ''}`}
                  onClick={() => onPreviewLang(item.code)}
                >
                  {(item.code || '').toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="admin__preview-body" onClick={handlePreviewClick}>
        {currentView === 'hero' ? (
          <PreviewScaler device={previewDevice} designData={designData}>
            <HomeSitePreview
              heroData={heroData}
              headerData={headerData}
              footerData={footerData}
              chromeData={chromeData}
              locale={previewLang}
              previewDevice={previewDevice}
              editMode
              editSelectedId={previewModuleId}
            />
          </PreviewScaler>
        ) : currentView === 'gate' ? (
          <PreviewScaler device={previewDevice} designData={designData}>
            <GatePreview
              payload={gateData}
              locale={previewLang}
              slideId={previewModuleId}
              previewDevice={previewDevice}
              editMode
              editSelectedId={previewModuleId}
            />
          </PreviewScaler>
        ) : currentView === 'header' ? (
          <PreviewScaler device={previewDevice} designData={designData}>
            {headerMode === 'menu' ? (
              <HeaderMenuPreview
                data={headerData}
                locale={previewLang}
                editMode
                editSelectedId={previewModuleId}
              />
            ) : (
              <HeaderClosedPreview
                data={headerData}
                locale={previewLang}
                editMode
                editSelectedId={previewModuleId}
              />
            )}
          </PreviewScaler>
        ) : currentView === 'footer' ? (
          <PreviewScaler device={previewDevice} designData={designData}>
            <FooterSitePreview
              data={footerData}
              locale={previewLang}
              editMode
              editSelectedId={previewModuleId}
            />
          </PreviewScaler>
        ) : currentView === 'chrome' ? (
          <PreviewScaler device={previewDevice} designData={designData}>
            <ChromeSitePreview
              data={chromeData}
              locale={previewLang}
              highlight={previewModuleId}
              editMode
              editSelectedId={previewModuleId}
            />
          </PreviewScaler>
        ) : currentView === 'design' ? (
          <PreviewScaler device={previewDevice} designData={designData}>
            <HomeSitePreview
              heroData={heroData}
              headerData={headerData}
              footerData={footerData}
              chromeData={chromeData}
              locale={previewLang}
              previewDevice={previewDevice}
            />
          </PreviewScaler>
        ) : (
          <div className="admin__empty">
            <h2>{copy.emptyTitle}</h2>
            <p>{copy.emptyDesc}</p>
          </div>
        )}
      </div>
    </div>
  )
}
