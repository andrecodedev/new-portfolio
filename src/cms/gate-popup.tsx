import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLocale } from '../i18n/LocaleProvider'
import { easeOutSoft } from '../motion/reveal'
import { useCmsGate } from './cms-provider'
import {
  slideToView,
  type CmsGatePayload,
  type GateSlide,
} from './gate-content'
import type { PreviewDevice } from './hero-stack'
import { openHeroLink } from './hero-content'

type ViewSlide = ReturnType<typeof slideToView>

function MediaPlaceholder() {
  return (
    <div className="gate__media-ph" aria-hidden="true">
      <div className="loader__dots">
        <span className="loader__dot" />
        <span className="loader__dot" />
        <span className="loader__dot" />
      </div>
    </div>
  )
}

function GateVisual({
  slide,
  reduce,
}: {
  slide: ViewSlide
  reduce: boolean
}) {
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setReady(false)
    setFailed(false)
  }, [slide.id, slide.image, slide.video])

  const src = slide.video || slide.image

  if (!src || failed) {
    return (
      <div className="gate__visual">
        <MediaPlaceholder />
      </div>
    )
  }

  return (
    <div className="gate__visual" aria-busy={!ready}>
      {ready ? null : <MediaPlaceholder />}
      {slide.video ? (
        <video
          className={`gate__media${ready ? ' gate__media--on' : ''}`}
          src={slide.video}
          muted
          loop
          playsInline
          autoPlay={!reduce}
          preload="auto"
          aria-label={slide.imageAlt}
          onLoadedData={() => setReady(true)}
          onError={() => setFailed(true)}
        />
      ) : (
        <img
          className={`gate__media${ready ? ' gate__media--on' : ''}`}
          src={slide.image}
          alt={slide.imageAlt}
          onLoad={() => setReady(true)}
          onError={() => setFailed(true)}
          ref={(node) => {
            if (!node) return
            if (node.complete && node.naturalWidth > 0) setReady(true)
          }}
        />
      )}
    </div>
  )
}

function GateSlideFace({
  slide,
  onNavigate,
  onClose,
  reduce,
  footer,
}: {
  slide: ViewSlide
  onNavigate?: (path: string) => void
  onClose?: () => void
  reduce: boolean
  footer?: ReactNode
}) {
  return (
    <div className="gate__spread" data-accent={slide.accent}>
      <GateVisual slide={slide} reduce={reduce} />
      <div className="gate__copy">
        <div className="gate__copy-main">
          {slide.kicker ? <p className="gate__kicker">{slide.kicker}</p> : null}
          {slide.title ? <h2 className="gate__headline">{slide.title}</h2> : null}
          {slide.body ? <p className="gate__body">{slide.body}</p> : null}
          {slide.buttons.length > 0 ? (
            <div className="gate__cta-row">
              {slide.buttons.map((button) => {
                const isLink = /^(https?:\/\/|mailto:|tel:)/i.test(button.to)
                if (isLink) {
                  return (
                    <a
                      key={button.id}
                      className="spot__btn gate__cta"
                      href={button.to}
                      target="_blank"
                      rel="noreferrer"
                      onClick={onClose}
                    >
                      {button.label}
                    </a>
                  )
                }
                return (
                  <button
                    key={button.id}
                    type="button"
                    className="spot__btn gate__cta"
                    onClick={() => {
                      onClose?.()
                      openHeroLink(button.to, onNavigate)
                    }}
                  >
                    {button.label}
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>
        {footer}
      </div>
    </div>
  )
}

type GateCarouselProps = {
  slides: GateSlide[]
  locale: ReturnType<typeof useLocale>['locale']
  index: number
  onIndex: (index: number) => void
  onNavigate?: (path: string) => void
  onClose?: () => void
  nextLabel: string
  prevLabel: string
  closeLabel: string
  showClose?: boolean
  reduce: boolean
}

export function GateCarousel({
  slides,
  locale,
  index,
  onIndex,
  onNavigate,
  onClose,
  nextLabel,
  prevLabel,
  closeLabel,
  showClose = true,
  reduce,
}: GateCarouselProps) {
  const views = slides.map((slide) => slideToView(slide, locale))
  const total = views.length
  const safeIndex = Math.min(index, Math.max(0, total - 1))
  const current = views[safeIndex]

  if (!current) return null

  return (
    <div className="gate__panel" role="dialog" aria-modal="true" aria-label={current.title}>
      {showClose ? (
        <button
          type="button"
          className="gate__close"
          aria-label={closeLabel}
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
      <div className="gate__stage">
        {views.map((slide, slideIndex) => {
          const active = slideIndex === safeIndex
          return (
            <div
              key={slide.id}
              className={`gate__slide${active ? ' gate__slide--active' : ''}`}
              aria-hidden={!active}
              inert={!active ? true : undefined}
            >
              <GateSlideFace
                slide={slide}
                onNavigate={onNavigate}
                onClose={onClose}
                reduce={reduce}
                footer={
                  total > 1 ? (
                    <div className="gate__nav">
                      <div className="gate__nav-side">
                        {safeIndex > 0 ? (
                          <button
                            type="button"
                            className="gate__nav-btn"
                            onClick={() => onIndex(safeIndex - 1)}
                          >
                            {prevLabel}
                          </button>
                        ) : null}
                      </div>
                      <p className="gate__dots" aria-hidden="true">
                        {views.map((item, dotIndex) => (
                          <span
                            key={item.id}
                            className={`gate__dot${dotIndex === safeIndex ? ' gate__dot--on' : ''}`}
                          />
                        ))}
                      </p>
                      <div className="gate__nav-side gate__nav-side--end">
                        {safeIndex < total - 1 ? (
                          <button
                            type="button"
                            className="gate__nav-btn"
                            onClick={() => onIndex(safeIndex + 1)}
                          >
                            {nextLabel}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : null
                }
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function GatePreview({
  payload,
  locale,
  slideId,
  previewDevice,
}: {
  payload: CmsGatePayload
  locale: ReturnType<typeof useLocale>['locale']
  slideId?: string | null
  previewDevice?: PreviewDevice
}) {
  const reduce = Boolean(useReducedMotion())
  const { t } = useLocale()
  const slides = slideId
    ? payload.slides
        .filter((slide) => slide.id === slideId)
        .map((slide) => ({ ...slide, enabled: true }))
    : payload.slides.filter((slide) => slide.enabled)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [slideId])

  return (
    <div className="gate gate--preview" data-preview-device={previewDevice}>
      <GateCarousel
        slides={slides}
        locale={locale}
        index={index}
        onIndex={setIndex}
        nextLabel={t.gate.next}
        prevLabel={t.gate.prev}
        closeLabel={t.chrome.close}
        showClose={false}
        reduce={reduce}
      />
    </div>
  )
}

type GatePopupProps = {
  open: boolean
  onClose: () => void
  onNavigate: (path: string) => void
}

export default function GatePopup({ open, onClose, onNavigate }: GatePopupProps) {
  const { t, locale } = useLocale()
  const reduce = Boolean(useReducedMotion())
  const openRef = useRef(open)
  const [index, setIndex] = useState(0)
  const payload = useCmsGate()
  openRef.current = open

  return (
    <AnimatePresence
      onExitComplete={() => {
        if (openRef.current) return
        setIndex(0)
      }}
    >
      {open ? (
        <div className="gate">
          <motion.button
            type="button"
            className="gate__backdrop"
            aria-label={t.chrome.close}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: reduce ? 0 : 0.42, ease: easeOutSoft }}
            style={{ width: 'min(100%, 840px)' }}
          >
            <GateCarousel
              slides={payload.slides.filter((slide) => slide.enabled)}
              locale={locale}
              index={index}
              onIndex={setIndex}
              onNavigate={onNavigate}
              onClose={onClose}
              nextLabel={t.gate.next}
              prevLabel={t.gate.prev}
              closeLabel={t.chrome.close}
              reduce={reduce}
            />
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
