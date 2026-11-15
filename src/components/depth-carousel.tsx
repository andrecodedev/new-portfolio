import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import gsap from 'gsap'
import { SkeletonImage } from './skeleton-image'
import DigitCounter from './digit-counter'
import './depth-carousel.css'

export type DepthCarouselItem = {
  image: string
  alt?: string
}

export type DepthCarouselProps = {
  items: DepthCarouselItem[]
  cardWidth?: number
  cardHeight?: number
  radius?: number
  tint?: string
  depth?: number
  spread?: number
  tilt?: number
  tiltDirection?: 'left' | 'right'
  perspective?: number
  visibleCards?: number
  falloff?: number
  blur?: number
  duration?: number
  ease?: string
  loop?: boolean
  showControls?: boolean
  showIndicators?: boolean
  /** Tipo de paginação: pontinhos ou contador "01 / 06" (igual aos outros carrosséis). */
  indicator?: 'dots' | 'counter'
  onChange?: (index: number, item: DepthCarouselItem) => void
  /** Quando definido, o card em foco pode ser clicado para virar e revelar este conteúdo. */
  renderBack?: (item: DepthCarouselItem, index: number) => ReactNode
  className?: string
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

type DragState = {
  x: number
  y: number
  startPos: number
  lastX: number
  lastT: number
  v: number
  moved: boolean
  /** Ainda não decidimos se é arrasto horizontal ou scroll vertical da página. */
  undecided: boolean
  id: number
}

export function DepthCarousel({
  items,
  cardWidth = 300,
  cardHeight = 380,
  radius = 18,
  tint = '#05060a',
  depth = 220,
  spread = 90,
  tilt = 22,
  tiltDirection = 'right',
  perspective = 1400,
  visibleCards = 4,
  falloff = 0.2,
  blur = 6,
  duration = 700,
  ease = 'power3.out',
  loop = true,
  showControls = true,
  showIndicators = true,
  indicator = 'dots',
  onChange,
  renderBack,
  className = '',
}: DepthCarouselProps) {
  const data = useMemo(() => items, [items])
  const count = data.length

  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const overlayRefs = useRef<(HTMLSpanElement | null)[]>([])

  const posRef = useRef(0)
  const focusRef = useRef(0)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const scaleRef = useRef(1)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const cfgRef = useRef({
    count,
    depth,
    spread,
    tilt,
    tiltDirection,
    visibleCards,
    falloff,
    blur,
    duration,
    ease,
    loop,
    cardWidth,
  })
  cfgRef.current = {
    count,
    depth,
    spread,
    tilt,
    tiltDirection,
    visibleCards,
    falloff,
    blur,
    duration,
    ease,
    loop,
    cardWidth,
  }

  const dragRef = useRef<DragState | null>(null)
  /** Sobrevive ao onPointerEnd (que zera dragRef) para o click seguinte saber se houve arrasto. */
  const draggedRef = useRef(false)
  const reducedRef = useRef(false)

  const [active, setActive] = useState(0)
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null)

  const layout = useCallback((pos: number) => {
    const cfg = cfgRef.current
    const n = cfg.count
    if (!n) return
    const dir = cfg.tiltDirection === 'left' ? -1 : 1
    const sc = scaleRef.current

    for (let i = 0; i < n; i++) {
      const el = cardRefs.current[i]
      if (!el) continue

      let d = i - pos
      if (cfg.loop && n > 1) {
        d = ((d % n) + n) % n
        if (d > n / 2) d -= n
      }

      const back = Math.max(0, d)
      const az = Math.abs(d)
      const shown = az <= cfg.visibleCards + 0.5

      const tz = -cfg.depth * d
      const tx = dir * cfg.spread * d
      const ry = dir * cfg.tilt * clamp(d, 0, 1)

      let opacity = d < 0 ? Math.max(0, 1 + d) : 1
      if (!shown) opacity = 0

      const brightness = Math.max(0.15, 1 - back * cfg.falloff)
      const blurPx =
        cfg.blur > 0 ? Math.min(cfg.blur, (back / Math.max(1, cfg.visibleCards)) * cfg.blur) : 0
      const zi = Math.round(2000 - d * 20)

      el.style.transform = `translate(-50%, -50%) scale(${sc}) translateX(${tx.toFixed(2)}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`
      el.style.opacity = opacity.toFixed(3)
      el.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`
      el.style.zIndex = String(zi)
      el.style.pointerEvents = shown && opacity > 0.05 ? 'auto' : 'none'

      const ov = overlayRefs.current[i]
      if (ov) ov.style.opacity = clamp(back * cfg.falloff * 1.25, 0, 0.86).toFixed(3)
    }
  }, [])

  const notify = useCallback(
    (idx: number) => {
      setActive(idx)
      setFlippedIndex(null)
      onChangeRef.current?.(idx, data[idx])
    },
    [data],
  )

  const tweenTo = useCallback(
    (target: number, animate: boolean) => {
      tweenRef.current?.kill()
      const cfg = cfgRef.current
      const proxy = { p: posRef.current }
      const dur = animate && !reducedRef.current ? cfg.duration / 1000 : 0
      tweenRef.current = gsap.to(proxy, {
        p: target,
        duration: dur,
        ease: cfg.ease,
        onUpdate: () => {
          posRef.current = proxy.p
          layout(proxy.p)
        },
        onComplete: () => {
          const n = cfg.count
          if (n > 0) posRef.current = ((posRef.current % n) + n) % n
          layout(posRef.current)
        },
      })
    },
    [layout],
  )

  const setFocus = useCallback(
    (rawIndex: number, animate = true) => {
      const cfg = cfgRef.current
      const n = cfg.count
      if (!n) return
      const idx = cfg.loop ? ((rawIndex % n) + n) % n : clamp(rawIndex, 0, n - 1)
      let delta = idx - posRef.current
      if (cfg.loop && n > 1) {
        delta = ((delta % n) + n) % n
        if (delta > n / 2) delta -= n
      }
      tweenTo(posRef.current + delta, animate)
      if (idx !== focusRef.current) {
        focusRef.current = idx
        notify(idx)
      }
    },
    [tweenTo, notify],
  )

  const navigateBy = useCallback((step: number) => setFocus(focusRef.current + step, true), [setFocus])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width
      const cfg = cfgRef.current
      const needed = cfg.cardWidth + Math.abs(cfg.spread) * 2 + 48
      scaleRef.current = clamp(w / needed, 0.4, 1)
      // O CSS usa a escala para posicionar paginação e setas junto do card reduzido.
      root.style.setProperty('--dc-scale', String(scaleRef.current))
      layout(posRef.current)
    })
    ro.observe(root)
    return () => ro.disconnect()
  }, [layout])

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const cfg = cfgRef.current
    if (cfg.count < 2) return
    tweenRef.current?.kill()
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPos: posRef.current,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
      moved: false,
      undecided: true,
      id: e.pointerId,
    }
  }, [])

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current
      if (!drag) return
      const cfg = cfgRef.current
      const stepPx = Math.max(cfg.cardWidth * 0.55 * scaleRef.current, 40)
      const dx = e.clientX - drag.x
      const dy = e.clientY - drag.y

      // Enquanto o gesto for ambíguo, só decide "é arrasto do carrossel" quando o
      // deslocamento horizontal já supera claramente o vertical. Sem isso, um scroll
      // vertical da página (touch/trackpad) com um mínimo de deriva lateral virava
      // arrasto por engano e travava o clique de virar o card (draggedRef preso em true).
      if (drag.undecided) {
        if (Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(dx)) {
          drag.undecided = false
          dragRef.current = null
          // Era scroll vertical da página: o tween foi morto no pointerdown, então assenta
          // no card mais próximo (senão a posição ficava fracionada e os cards travavam).
          setFocus(Math.round(posRef.current), true)
          return
        }
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
          drag.undecided = false
          drag.moved = true
          draggedRef.current = true
          rootRef.current?.setPointerCapture(drag.id)
        } else {
          return
        }
      }
      if (!drag.moved) return
      const now = performance.now()
      const dt = Math.max(now - drag.lastT, 1)
      drag.v = (e.clientX - drag.lastX) / dt
      drag.lastX = e.clientX
      drag.lastT = now
      posRef.current = drag.startPos - dx / stepPx
      layout(posRef.current)
    },
    [layout, setFocus],
  )

  const onPointerEnd = useCallback(() => {
    const drag = dragRef.current
    if (!drag) return
    dragRef.current = null
    if (!drag.moved) {
      // Toque sem arrastar: o onPointerDown matou o tween em andamento e a posição ficava
      // fracionada (cards travados/transparentes, flip no card errado). Assenta no mais próximo.
      setFocus(Math.round(posRef.current), true)
      return
    }
    const cfg = cfgRef.current
    const stepPx = Math.max(cfg.cardWidth * 0.55 * scaleRef.current, 40)
    const projected = posRef.current - (drag.v * 180) / stepPx
    setFocus(Math.round(projected), true)
  }, [setFocus])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateBy(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigateBy(1)
      }
    },
    [navigateBy],
  )

  const onCardClick = useCallback(
    (index: number) => {
      if (draggedRef.current) {
        draggedRef.current = false
        return
      }
      if (renderBack && index === focusRef.current) {
        setFlippedIndex((cur) => (cur === index ? null : index))
        return
      }
      setFocus(index, true)
    },
    [setFocus, renderBack],
  )

  useEffect(() => {
    reducedRef.current =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    layout(posRef.current)
  }, [layout, depth, spread, tilt, tiltDirection, visibleCards, falloff, blur, cardWidth, cardHeight, radius, count])

  useEffect(
    () => () => {
      tweenRef.current?.kill()
    },
    [],
  )

  return (
    <div
      ref={rootRef}
      className={`depth-carousel ${className}`.trim()}
      style={
        {
          '--dc-perspective': `${perspective}px`,
          '--dc-card-w': `${cardWidth}px`,
          '--dc-card-h': `${cardHeight}px`,
        } as React.CSSProperties
      }
      role="group"
      aria-roledescription="carousel"
      aria-label="Carrossel"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}
    >
      <div className="depth-carousel__stage" ref={stageRef}>
        {data.map((item, i) => (
          <div
            key={i}
            className={`depth-carousel__card${renderBack ? ' depth-carousel__card--flip' : ''}`}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            style={
              {
                width: cardWidth,
                height: cardHeight,
                borderRadius: radius,
                '--dc-radius': `${radius}px`,
              } as React.CSSProperties
            }
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${count}`}
            aria-hidden={active !== i}
            onClick={() => onCardClick(i)}
          >
            {renderBack ? (
              <div
                className={`depth-carousel__flip${flippedIndex === i ? ' is-flipped' : ''}`}
              >
                <div className="depth-carousel__face depth-carousel__face--front">
                  <SkeletonImage frameClassName="depth-carousel__img-frame" className="depth-carousel__img" src={item.image} alt={item.alt || ''} />
                  <span
                    className="depth-carousel__tint"
                    ref={(el) => {
                      overlayRefs.current[i] = el
                    }}
                    style={{ background: tint }}
                  />
                  {active === i && flippedIndex !== i ? (
                    <span className="depth-carousel__flip-hint" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  ) : null}
                </div>
                <div className="depth-carousel__face depth-carousel__face--back">
                  {renderBack(item, i)}
                </div>
              </div>
            ) : (
              <>
                <SkeletonImage frameClassName="depth-carousel__img-frame" className="depth-carousel__img" src={item.image} alt={item.alt || ''} />
                <span
                  className="depth-carousel__tint"
                  ref={(el) => {
                    overlayRefs.current[i] = el
                  }}
                  style={{ background: tint }}
                />
              </>
            )}
          </div>
        ))}
      </div>

      {showControls && count > 1 && (
        <div className="depth-carousel__nav">
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--prev"
            aria-label="Anterior"
            onClick={() => navigateBy(-1)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M15 5l-7 7 7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--next"
            aria-label="Próximo"
            onClick={() => navigateBy(1)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M9 5l7 7-7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}

      {showIndicators && count > 1 && indicator === 'counter' && (
        <div className="depth-carousel__count">
          <DigitCounter value={active + 1} total={count} />
        </div>
      )}
      {showIndicators && count > 1 && indicator !== 'counter' && (
        <div className="depth-carousel__dots" role="tablist" aria-label="Slides">
          {data.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Ir para o slide ${i + 1}`}
              className={`depth-carousel__dot${active === i ? ' is-active' : ''}`}
              onClick={() => setFocus(i, true)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default DepthCarousel
