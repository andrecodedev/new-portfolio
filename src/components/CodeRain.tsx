import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  DEFAULT_RAIN_TEXTS,
  rainActiveTexts,
  type RainConfig,
} from '../cms/rain-content'

type CodeRainProps = {
  className?: string
  config?: RainConfig | null
}

function pickChar(words: readonly string[]) {
  if (words.length === 0) return DEFAULT_RAIN_TEXTS[0]
  return words[Math.floor(Math.random() * words.length)]
}

/** Opacidade por stream: uns mais fracos, outros mais fortes. */
function randomRainOpacity(isMobile: boolean) {
  const min = isMobile ? 0.08 : 0.1
  const max = isMobile ? 0.34 : 0.42
  const roll = Math.random()

  if (roll < 0.3) {
    return min + Math.random() * (max - min) * 0.35
  }
  if (roll < 0.7) {
    return min + (max - min) * (0.35 + Math.random() * 0.3)
  }
  return min + (max - min) * (0.65 + Math.random() * 0.35)
}

function CodeRain({ className = 'code-rain', config }: CodeRainProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [areaHeight, setAreaHeight] = useState(800)
  const [isMobile, setIsMobile] = useState(false)
  const [isCompact, setIsCompact] = useState(false)

  const enabled = config?.enabled !== false
  const color = config?.color?.trim() || ''
  const words = useMemo(
    () => (config ? rainActiveTexts(config) : [...DEFAULT_RAIN_TEXTS]),
    [config],
  )

  useEffect(() => {
    const root = rootRef.current
    const host = root?.parentElement
    if (!host) return

    const updateViewport = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsCompact(width < 1025)
    }
    updateViewport()
    window.addEventListener('resize', updateViewport)

    const observer = new ResizeObserver((entries) => {
      const nextHeight = entries[0]?.contentRect.height
      if (nextHeight && nextHeight > 0) setAreaHeight(nextHeight)
    })

    observer.observe(host)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateViewport)
    }
  }, [])

  const streams = useMemo(() => {
    if (!enabled) return []
    const height = Math.max(areaHeight, 600)
    const topBand = Math.min(window.innerHeight || 800, height)
    const density = isMobile ? 72 : 52
    const fullCount = Math.min(
      Math.max(Math.round(height / density), 24),
      isMobile ? 64 : 96,
    )
    const topCount = isMobile ? 16 : 22

    const makeStream = (
      index: string,
      startY: number,
      endY: number,
      phase: number,
    ) => {
      const distance = endY - startY
      const pixelsPerSecond = isMobile
        ? 18 + Math.random() * 12
        : 20 + Math.random() * 14
      const duration = Math.max(distance / pixelsPerSecond, 18)

      const fontSizeVw = isCompact
        ? 1.05 + Math.random() * 0.55
        : 0.6 + Math.random() * 0.35
      const fontSizeMinRem = isCompact ? 0.55 : 0.62

      return {
        id: index,
        left: `${Math.random() * 100}%`,
        startY,
        endY,
        duration,
        delay: -phase * duration,
        char: pickChar(words),
        fontSize: `max(${fontSizeMinRem}rem, ${fontSizeVw}vw)`,
        opacity: randomRainOpacity(isMobile || isCompact),
      }
    }

    const fullStreams = Array.from({ length: fullCount }, (_, index) => {
      const startY = -100 - Math.random() * 140
      const endY = height + 60 + Math.random() * 140
      const phase = (index + Math.random() * 0.35) / fullCount
      return makeStream(`full-${index}`, startY, endY, phase)
    })

    const topStreams = Array.from({ length: topCount }, (_, index) => {
      const startY = -80 - Math.random() * 100
      const endY = topBand * (0.55 + Math.random() * 0.55)
      const phase = (index + Math.random() * 0.4) / topCount
      return makeStream(`top-${index}`, startY, endY, phase)
    })

    return [...fullStreams, ...topStreams]
  }, [areaHeight, isMobile, isCompact, enabled, words])

  if (!enabled) return null

  return (
    <div
      ref={rootRef}
      className={className}
      aria-hidden="true"
      style={color ? { color } : undefined}
    >
      {streams.map((stream) => (
        <motion.span
          key={stream.id}
          className="code-rain__char"
          initial={{ y: stream.startY, opacity: stream.opacity * 0.45 }}
          animate={{
            y: [stream.startY, stream.endY],
            opacity: [
              stream.opacity * 0.45,
              stream.opacity,
              stream.opacity,
              stream.opacity * 0.25,
            ],
          }}
          transition={{
            duration: stream.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: stream.delay,
          }}
          style={{
            left: stream.left,
            fontSize: stream.fontSize,
            willChange: 'transform, opacity',
          }}
        >
          {stream.char}
        </motion.span>
      ))}
    </div>
  )
}

export default CodeRain
