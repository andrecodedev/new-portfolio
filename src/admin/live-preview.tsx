import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Locale } from '../i18n/copy'
import type { CmsHeroPayload } from '../cms/hero-content'
import type { CmsGatePayload } from '../cms/gate-content'
import { GatePreview } from '../cms/gate-popup'
import { HeroModulesView, type PreviewDevice } from '../cms/hero-stack'
import type { AdminView } from './sidebar-menu'
import { adminCopy } from './admin-copy'

const DESKTOP_PREVIEW_WIDTH = 1100
const MOBILE_PREVIEW_WIDTH = 390

type LivePreviewProps = {
  currentView: AdminView
  previewLang: Locale
  onPreviewLang: (locale: Locale) => void
  previewDevice: PreviewDevice
  onPreviewDevice: (device: PreviewDevice) => void
  heroData: CmsHeroPayload
  gateData: CmsGatePayload
  previewModuleId?: string | null
}

function PreviewScaler({
  device,
  children,
}: {
  device: PreviewDevice
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
    <div ref={viewportRef} className="admin-preview-frame">
      <div
        className="admin-preview-frame__slot"
        style={{
          width: canvasWidth * scale,
          height: canvasHeight * scale,
        }}
      >
        <div
          ref={canvasRef}
          className={`admin-preview admin-preview--${device}`}
          style={{
            width: canvasWidth,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
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
  previewModuleId,
}: LivePreviewProps) {
  const copy = adminCopy.dashboard
  const previewModules = previewModuleId
    ? heroData.modules
        .filter((module) => module.id === previewModuleId)
        .map((module) => ({ ...module, enabled: true }))
    : heroData.modules

  return (
    <div className="admin__preview">
      <div className="admin__preview-bar">
        <span>
          {currentView === 'hero' || currentView === 'gate'
            ? copy.previewLive
            : copy.previewIdle}
        </span>
        <div className="admin__preview-controls">
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
            {(['pt', 'en', 'es'] as const).map((code) => (
              <button
                key={code}
                type="button"
                className={`admin__lang${previewLang === code ? ' admin__lang--on' : ''}`}
                onClick={() => onPreviewLang(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="admin__preview-body">
        {currentView === 'hero' ? (
          <PreviewScaler device={previewDevice}>
            <HeroModulesView
              modules={previewModules}
              locale={previewLang}
              previewDevice={previewDevice}
            />
          </PreviewScaler>
        ) : currentView === 'gate' ? (
          <PreviewScaler device={previewDevice}>
            <GatePreview
              payload={gateData}
              locale={previewLang}
              slideId={previewModuleId}
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
