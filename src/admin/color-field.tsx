import { useEffect, useId, useRef, useState } from 'react'
import { ACCENT_SWATCHES } from '../cms/accent-swatches'
import { adminCopy } from './admin-copy'

const RECENT_KEY = 'portfolio-admin-recent-colors'
const MAX_RECENT = 12

const PRESET_HEX: Record<string, string> = {
  work: '#f0d45c',
  'work-deep': '#fbbf24',
  'work-pale': '#fde68a',
  about: '#74d7a4',
  'about-deep': '#34d399',
  'about-pale': '#bbf7d0',
  reading: '#78bfee',
  'reading-deep': '#38bdf8',
  'reading-pale': '#bae6fd',
  hire: '#c4b5fd',
  'hire-deep': '#a78bfa',
  'hire-pale': '#ede9fe',
  contact: '#f0aaa5',
  'contact-deep': '#f87171',
  'contact-pale': '#fecaca',
  teal: '#2dd4bf',
  rose: '#f472b6',
  lime: '#a3e635',
}

const NEUTRALS = ['#ffffff', '#f5f5f5', '#d4d4d4', '#737373', '#171717', '#000000']

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item): item is string => typeof item === 'string')
      .slice(0, MAX_RECENT)
  } catch {
    return []
  }
}

function pushRecent(hex: string) {
  const normalized = normalizeHex(hex)
  if (!normalized) return
  const next = [normalized, ...readRecent().filter((item) => item !== normalized)].slice(
    0,
    MAX_RECENT,
  )
  localStorage.setItem(RECENT_KEY, JSON.stringify(next))
}

function normalizeHex(value: string) {
  const raw = value.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toLowerCase()
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    const [, a, b, c] = raw
    return `#${a}${a}${b}${b}${c}${c}`.toLowerCase()
  }
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toLowerCase()}`
  return ''
}

function hexToHsv(hex: string) {
  const normalized = normalizeHex(hex) || '#000000'
  const r = Number.parseInt(normalized.slice(1, 3), 16) / 255
  const g = Number.parseInt(normalized.slice(3, 5), 16) / 255
  const b = Number.parseInt(normalized.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let h = 0
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6
    else if (max === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4
    h *= 60
    if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : delta / max
  return { h, s, v: max }
}

function hsvToHex(h: number, s: number, v: number) {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const to = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

type ColorFieldProps = {
  label: string
  value: string
  fallback?: string
  onChange: (next: string) => void
}

export default function ColorField({
  label,
  value,
  fallback = '',
  onChange,
}: ColorFieldProps) {
  const copy = adminCopy.dashboard
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const [draftHex, setDraftHex] = useState(value || fallback || '#000000')
  const hsv = hexToHsv(draftHex)

  useEffect(() => {
    setRecent(readRecent())
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setCustomOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open])

  const display = value || fallback || '#000000'
  const presets = [
    ...NEUTRALS,
    ...ACCENT_SWATCHES.map((swatch) => PRESET_HEX[swatch.id]).filter(Boolean),
  ]

  const commit = (hex: string) => {
    const normalized = normalizeHex(hex)
    if (!normalized) return
    pushRecent(normalized)
    setRecent(readRecent())
    onChange(normalized)
    setDraftHex(normalized)
  }

  return (
    <div className="admin-color" ref={rootRef}>
      <label className="admin__label" htmlFor={id}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        className="admin-color__trigger"
        onClick={() => {
          setOpen((current) => !current)
          setCustomOpen(false)
          setDraftHex(value || fallback || '#000000')
        }}
      >
        <span className="admin-color__swatch" style={{ background: display }} />
        <span className="admin-color__hex">{value || copy.colorDefault}</span>
      </button>

      {open ? (
        <div className="admin-color__popover" role="dialog">
          {!customOpen ? (
            <>
              {recent.length > 0 ? (
                <div className="admin-color__section">
                  <p className="admin-color__section-title">{copy.colorRecent}</p>
                  <div className="admin-color__grid">
                    {recent.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        className={`admin-color__dot${value === hex ? ' admin-color__dot--on' : ''}`}
                        style={{ background: hex }}
                        title={hex}
                        onClick={() => {
                          commit(hex)
                          setOpen(false)
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="admin-color__section">
                <p className="admin-color__section-title">{copy.colorPalette}</p>
                <div className="admin-color__grid">
                  {presets.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      className={`admin-color__dot${value === hex ? ' admin-color__dot--on' : ''}`}
                      style={{ background: hex }}
                      title={hex}
                      onClick={() => {
                        commit(hex)
                        setOpen(false)
                      }}
                    />
                  ))}
                  <button
                    type="button"
                    className="admin-color__dot admin-color__dot--add"
                    title={copy.colorCustom}
                    onClick={() => setCustomOpen(true)}
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="admin__btn admin__btn--ghost admin-color__reset"
                onClick={() => {
                  onChange(fallback)
                  setOpen(false)
                }}
              >
                {copy.colorReset}
              </button>
            </>
          ) : (
            <div className="admin-color__custom">
              <p className="admin-color__section-title">{copy.colorCustom}</p>
              <div
                className="admin-color__sv"
                style={{ backgroundColor: hsvToHex(hsv.h, 1, 1) }}
                onPointerDown={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  const move = (clientX: number, clientY: number) => {
                    const s = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
                    const v = Math.min(
                      1,
                      Math.max(0, 1 - (clientY - rect.top) / rect.height),
                    )
                    setDraftHex(hsvToHex(hsv.h, s, v))
                  }
                  move(event.clientX, event.clientY)
                  const onMove = (pointer: PointerEvent) =>
                    move(pointer.clientX, pointer.clientY)
                  const onUp = () => {
                    window.removeEventListener('pointermove', onMove)
                    window.removeEventListener('pointerup', onUp)
                  }
                  window.addEventListener('pointermove', onMove)
                  window.addEventListener('pointerup', onUp)
                }}
              >
                <span
                  className="admin-color__sv-knob"
                  style={{
                    left: `${hsv.s * 100}%`,
                    top: `${(1 - hsv.v) * 100}%`,
                  }}
                />
              </div>
              <input
                className="admin-color__hue"
                type="range"
                min={0}
                max={360}
                value={Math.round(hsv.h)}
                onChange={(event) => {
                  const h = Number(event.target.value)
                  setDraftHex(hsvToHex(h, hsv.s, hsv.v))
                }}
              />
              <div className="admin-color__hex-row">
                <span
                  className="admin-color__swatch"
                  style={{ background: draftHex }}
                />
                <input
                  className="admin__input"
                  type="text"
                  value={draftHex}
                  onChange={(event) => setDraftHex(event.target.value)}
                />
              </div>
              <div className="admin-color__actions">
                <button
                  type="button"
                  className="admin__btn admin__btn--ghost"
                  onClick={() => setCustomOpen(false)}
                >
                  {copy.cancel}
                </button>
                <button
                  type="button"
                  className="admin__btn admin__btn--solid"
                  onClick={() => {
                    commit(draftHex)
                    setCustomOpen(false)
                    setOpen(false)
                  }}
                >
                  {copy.colorChoose}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
