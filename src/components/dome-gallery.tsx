import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useGesture } from '@use-gesture/react'
import './dome-gallery.css'

/*
 * Dome Gallery (React Bits), portado para TSX e simplificado: o clique no tile chama `onItemClick`
 * (sem o visualizador ampliado da versão original), porque aqui cada tile é um link.
 */

export type DomeItem = {
  src: string
  alt: string
  /** Texto fixo no tile. */
  label?: string
  href?: string
}

export type DomeGalleryProps = {
  images: DomeItem[]
  fit?: number
  fitBasis?: 'auto' | 'min' | 'max' | 'width' | 'height'
  minRadius?: number
  maxRadius?: number
  maxVerticalRotationDeg?: number
  dragSensitivity?: number
  segments?: number
  dragDampening?: number
  imageBorderRadius?: string
  /** Texto que aparece com a lupa ao passar o mouse. */
  hint?: string
  /** Cor das bordas que dissolvem a cúpula (use a cor do fundo da página). */
  fadeColor?: string
  /** Gira sozinha, devagar (graus por segundo em `autoRotateSpeed`). Pausa ao arrastar. */
  autoRotate?: boolean
  autoRotateSpeed?: number
  onItemClick?: (item: DomeItem) => void
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)
const wrapAngleSigned = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180

type Tile = { x: number; y: number; sizeX: number; sizeY: number; item: DomeItem }

/** Gerador pseudo-aleatório com semente: o sorteio é "aleatório", mas igual a cada render (sem piscar). */
function seededRandom(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function shuffled<T>(list: readonly T[], random: () => number): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Distribuição dos itens na cúpula.
 * - Faixa central (|y| <= 2) é a legível (as pontas ficam inclinadas e em fade): é preenchida primeiro e
 *   cada item aparece ali antes de qualquer repetição, então todo item passa pelo meio ao girar.
 * - Um item nunca fica colado no mesmo item. Primeiro evita repetir numa vizinhança larga (2 colunas,
 *   com a cúpula dando a volta); se o grupo é pequeno demais, evita os tiles que se tocam e, em último caso, só os que dividem borda.
 * - A escolha entre os candidatos é por menor uso + sorteio com semente (aleatório, mas estável).
 */
function buildOnce(pool: DomeItem[], seg: number, attempt: number): { tiles: Tile[]; bad: number } {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2)
  const evenYs = [-4, -2, 0, 2, 4]
  const oddYs = [-3, -1, 1, 3, 5]
  const coords = xCols.flatMap((x, c) =>
    (c % 2 === 0 ? evenYs : oddYs).map((y) => ({ x, y, col: c, sizeX: 2, sizeY: 2 })),
  )

  const colDist = (a: number, b: number) => {
    const d = Math.abs(a - b)
    return Math.min(d, seg - d)
  }
  const touching = (i: number, j: number) => {
    const dc = colDist(coords[i].col, coords[j].col)
    const dy = Math.abs(coords[i].y - coords[j].y)
    return (dc === 0 && dy <= 2) || (dc === 1 && dy <= 3)
  }
  const sharesEdge = (i: number, j: number) => {
    const dc = colDist(coords[i].col, coords[j].col)
    const dy = Math.abs(coords[i].y - coords[j].y)
    return (dc === 0 && dy <= 2) || (dc === 1 && dy <= 1)
  }
  const near = (i: number, j: number) => colDist(coords[i].col, coords[j].col) <= 2 && Math.abs(coords[i].y - coords[j].y) <= 4

  const random = seededRandom(pool.length * 7919 + seg + attempt * 104729)
  const assigned: (DomeItem | null)[] = coords.map(() => null)
  const usedCenter = new Map<DomeItem, number>()
  const usedEdge = new Map<DomeItem, number>()

  const order = (indexes: number[]) => shuffled(indexes, random)
  const centerIdx = order(coords.map((_, i) => i).filter((i) => Math.abs(coords[i].y) <= 2))
  const edgeIdx = order(coords.map((_, i) => i).filter((i) => Math.abs(coords[i].y) > 2))

  const place = (i: number, usage: Map<DomeItem, number>) => {
    const blocked = (rule: (a: number, b: number) => boolean) => {
      const set = new Set<DomeItem>()
      for (let j = 0; j < coords.length; j++) {
        const other = assigned[j]
        if (other && j !== i && rule(i, j)) set.add(other)
      }
      return set
    }
    let candidates = pool.filter((item) => !blocked(near).has(item))
    if (candidates.length === 0) candidates = pool.filter((item) => !blocked(touching).has(item))
    if (candidates.length === 0) candidates = pool.filter((item) => !blocked(sharesEdge).has(item))
    if (candidates.length === 0) candidates = pool
    const least = Math.min(...candidates.map((item) => usage.get(item) ?? 0))
    const best = candidates.filter((item) => (usage.get(item) ?? 0) === least)
    const pick = best[Math.floor(random() * best.length)]
    assigned[i] = pick
    usage.set(pick, (usage.get(pick) ?? 0) + 1)
  }

  centerIdx.forEach((i) => place(i, usedCenter))
  edgeIdx.forEach((i) => place(i, usedEdge))

  let bad = 0
  for (let i = 0; i < coords.length; i++) {
    for (let j = i + 1; j < coords.length; j++) {
      if (assigned[i] === assigned[j] && sharesEdge(i, j)) bad++
    }
  }
  const tiles = coords.map((c, i) => ({ x: c.x, y: c.y, sizeX: c.sizeX, sizeY: c.sizeY, item: assigned[i] as DomeItem }))
  return { tiles, bad }
}

/** Tenta algumas sementes e fica com a que não deixa nenhum item igual colado (grupos pequenos podem precisar de várias). */
function buildTiles(pool: DomeItem[], seg: number): Tile[] {
  if (pool.length === 0) return []
  let best = buildOnce(pool, seg, 0)
  for (let attempt = 1; attempt < 60 && best.bad > 0; attempt++) {
    const next = buildOnce(pool, seg, attempt)
    if (next.bad < best.bad) best = next
  }
  return best.tiles
}

export default function DomeGallery({
  images,
  fit = 0.8,
  fitBasis = 'auto',
  minRadius = 600,
  maxRadius = Infinity,
  maxVerticalRotationDeg = 0,
  dragSensitivity = 20,
  segments = 34,
  dragDampening = 2,
  imageBorderRadius = '10px',
  hint = '',
  fadeColor = '#1c1c1c',
  autoRotate = false,
  autoRotateSpeed = 4,
  onItemClick,
}: DomeGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const sphereRef = useRef<HTMLDivElement>(null)
  const rotationRef = useRef({ x: 0, y: 0 })
  const startRotRef = useRef({ x: 0, y: 0 })
  const startPosRef = useRef<{ x: number; y: number } | null>(null)
  const draggingRef = useRef(false)
  const movedRef = useRef(false)
  const lastDragEndAt = useRef(0)
  const inertiaRAF = useRef<number | null>(null)
  const tileRefs = useRef<(HTMLDivElement | null)[]>([])
  const visibleRef = useRef<boolean[]>([])

  const tiles = useMemo(() => buildTiles(images, segments), [images, segments])

  // Tiles do lado de trás da esfera ficam invisíveis (backface), mas continuam sendo camadas de GPU.
  // No celular isso trava o scroll: só mantemos montado o que está virado pra frente (+ margem).
  const tileAngles = useMemo(() => tiles.map((tile) => (360 / segments / 2) * (tile.x + 0.5)), [tiles, segments])

  const applyTransform = useCallback(
    (xDeg: number, yDeg: number) => {
      const el = sphereRef.current
      if (el) el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`
      for (let i = 0; i < tileAngles.length; i++) {
        const show = Math.abs(wrapAngleSigned(tileAngles[i] + yDeg)) < 105
        if (visibleRef.current[i] === show) continue
        visibleRef.current[i] = show
        const node = tileRefs.current[i]
        if (node) node.style.display = show ? '' : 'none'
      }
    },
    [tileAngles],
  )

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect
      const w = Math.max(1, cr.width)
      const h = Math.max(1, cr.height)
      const minDim = Math.min(w, h)
      const maxDim = Math.max(w, h)
      const aspect = w / h
      const basis =
        fitBasis === 'min' ? minDim : fitBasis === 'max' ? maxDim : fitBasis === 'width' ? w : fitBasis === 'height' ? h : aspect >= 1.3 ? w : minDim
      const radius = clamp(Math.min(basis * fit, h * 1.35), minRadius, maxRadius)
      root.style.setProperty('--radius', `${Math.round(radius)}px`)
      applyTransform(rotationRef.current.x, rotationRef.current.y)
    })
    ro.observe(root)
    return () => ro.disconnect()
  }, [fit, fitBasis, minRadius, maxRadius, applyTransform])

  useEffect(() => {
    visibleRef.current = []
    applyTransform(rotationRef.current.x, rotationRef.current.y)
  }, [applyTransform])

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) cancelAnimationFrame(inertiaRAF.current)
    inertiaRAF.current = null
  }, [])

  useEffect(() => stopInertia, [stopInertia])

  const startInertia = useCallback(
    (vx: number, vy: number) => {
      const MAX_V = 1.4
      let vX = clamp(vx, -MAX_V, MAX_V) * 80
      let vY = clamp(vy, -MAX_V, MAX_V) * 80
      let frames = 0
      const d = clamp(dragDampening, 0, 1)
      const frictionMul = 0.94 + 0.055 * d
      const stopThreshold = 0.015 - 0.01 * d
      const maxFrames = Math.round(90 + 270 * d)
      const step = () => {
        vX *= frictionMul
        vY *= frictionMul
        if ((Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) || ++frames > maxFrames) {
          inertiaRAF.current = null
          return
        }
        const nextX = clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg)
        const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200)
        rotationRef.current = { x: nextX, y: nextY }
        applyTransform(nextX, nextY)
        inertiaRAF.current = requestAnimationFrame(step)
      }
      stopInertia()
      inertiaRAF.current = requestAnimationFrame(step)
    },
    [dragDampening, maxVerticalRotationDeg, stopInertia, applyTransform],
  )

  useGesture(
    {
      onDragStart: ({ event }) => {
        stopInertia()
        const evt = event as PointerEvent
        draggingRef.current = true
        movedRef.current = false
        startRotRef.current = { ...rotationRef.current }
        startPosRef.current = { x: evt.clientX, y: evt.clientY }
      },
      onDrag: ({ event, last, velocity = [0, 0], direction = [0, 0], movement }) => {
        if (!draggingRef.current || !startPosRef.current) return
        const evt = event as PointerEvent
        const dxTotal = evt.clientX - startPosRef.current.x
        const dyTotal = evt.clientY - startPosRef.current.y
        if (!movedRef.current && dxTotal * dxTotal + dyTotal * dyTotal > 16) movedRef.current = true
        const nextX = clamp(startRotRef.current.x - dyTotal / dragSensitivity, -maxVerticalRotationDeg, maxVerticalRotationDeg)
        const nextY = wrapAngleSigned(startRotRef.current.y + dxTotal / dragSensitivity)
        if (rotationRef.current.x !== nextX || rotationRef.current.y !== nextY) {
          rotationRef.current = { x: nextX, y: nextY }
          applyTransform(nextX, nextY)
        }
        if (last) {
          draggingRef.current = false
          let vx = velocity[0] * direction[0]
          let vy = velocity[1] * direction[1]
          if (Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001 && Array.isArray(movement)) {
            vx = clamp((movement[0] / dragSensitivity) * 0.02, -1.2, 1.2)
            vy = clamp((movement[1] / dragSensitivity) * 0.02, -1.2, 1.2)
          }
          if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) startInertia(vx, vy)
          if (movedRef.current) lastDragEndAt.current = performance.now()
          movedRef.current = false
        }
      },
    },
    { target: mainRef, eventOptions: { passive: true } },
  )

  // Se o navegador toma o gesto (scroll vertical no celular), o drag termina sem passar pelo `last`.
  useEffect(() => {
    const main = mainRef.current
    if (!main) return
    const release = () => {
      draggingRef.current = false
    }
    main.addEventListener('pointercancel', release)
    main.addEventListener('pointerup', release)
    return () => {
      main.removeEventListener('pointercancel', release)
      main.removeEventListener('pointerup', release)
    }
  }, [])

  // Giro automático: lento e suave. Só avança quando ninguém está arrastando e a inércia já acabou.
  useEffect(() => {
    const root = rootRef.current
    if (!autoRotate || !root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let visible = true
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    io.observe(root)
    let frame = 0
    let last = performance.now()
    const tick = (time: number) => {
      const dt = Math.min((time - last) / 1000, 0.05)
      last = time
      if (visible && !draggingRef.current && inertiaRAF.current === null && !document.hidden) {
        const nextY = wrapAngleSigned(rotationRef.current.y + autoRotateSpeed * dt)
        rotationRef.current = { ...rotationRef.current, y: nextY }
        applyTransform(rotationRef.current.x, nextY)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      io.disconnect()
    }
  }, [autoRotate, autoRotateSpeed, applyTransform])

  const activate = (item: DomeItem) => {
    if (draggingRef.current || movedRef.current) return
    if (performance.now() - lastDragEndAt.current < 80) return
    onItemClick?.(item)
  }

  return (
    <div
      ref={rootRef}
      className="dome-root"
      style={
        {
          '--segments-x': segments,
          '--segments-y': segments,
          '--fade-color': fadeColor,
          '--tile-radius': imageBorderRadius,
        } as React.CSSProperties
      }
    >
      <div ref={mainRef} className="dome-main">
        <div className="dome-stage">
          <div ref={sphereRef} className="dome-sphere">
            {tiles.map((tile, i) => (
              <div
                key={`${tile.x},${tile.y},${i}`}
                ref={(node) => {
                  tileRefs.current[i] = node
                }}
                className="dome-item"
                style={
                  {
                    '--offset-x': tile.x,
                    '--offset-y': tile.y,
                    '--item-size-x': tile.sizeX,
                    '--item-size-y': tile.sizeY,
                  } as React.CSSProperties
                }
              >
                <div
                  className="dome-tile"
                  role="link"
                  tabIndex={0}
                  aria-label={tile.item.alt}
                  onClick={() => activate(tile.item)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') onItemClick?.(tile.item)
                  }}
                >
                  <img src={tile.item.src} alt="" draggable={false} />
                  <span className="dome-tile__label">{tile.item.label ?? tile.item.alt}</span>
                  <span className="dome-tile__hint" aria-hidden>
                    <svg viewBox="0 0 256 256" width="20" height="20" fill="currentColor">
                      <path d="M232.49 215.51 185 168a92.12 92.12 0 1 0-17 17l47.53 47.54a12 12 0 0 0 17-17ZM44 112a68 68 0 1 1 68 68 68.07 68.07 0 0 1-68-68Z" />
                    </svg>
                    {hint}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="dome-fade dome-fade--vignette" />
        <div className="dome-fade dome-fade--top" />
        <div className="dome-fade dome-fade--bottom" />
        <div className="dome-fade dome-fade--left" />
        <div className="dome-fade dome-fade--right" />
      </div>
    </div>
  )
}
