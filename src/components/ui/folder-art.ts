import type { ArtPreset, ArtRecipe } from './glass-folder-cards'

/** `#rgb` / `#rrggbb` → RGB. Unreadable values fall back to mid grey. */
function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace(/^#/, '')
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  const n = /^[0-9a-f]{6}$/i.test(h) ? Number.parseInt(h, 16) : 0x808080
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(r: number, g: number, b: number) {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

/**
 * Turns a brand / folder hex into a liquid marble recipe so the glass front
 * still reads the project colour through the frosted panel.
 */
export function recipeFromHex(hex: string): ArtRecipe {
  const rgb = hexToRgb(hex)
  const ink = mix(rgb, [8, 10, 14], 0.72)
  const deep = mix(rgb, [10, 12, 18], 0.45)
  const mid = mix(rgb, [255, 255, 255], 0.08)
  const lift = mix(rgb, [255, 240, 220], 0.35)
  const foam = mix(rgb, [255, 250, 245], 0.72)
  return {
    style: 'marble',
    colors: [rgbToHex(...ink), rgbToHex(...deep), rgbToHex(...mid), rgbToHex(...rgb), rgbToHex(...lift), rgbToHex(...foam)],
    scale: 0.68,
    warp: 3.1,
    angle: -0.45,
    gloss: 0.48,
    veins: 0.45,
  }
}

const PRESET_BY_HUE: { max: number; preset: ArtPreset }[] = [
  { max: 25, preset: 'ember' },
  { max: 55, preset: 'dusk' },
  { max: 95, preset: 'verdant' },
  { max: 175, preset: 'glacier' },
  { max: 255, preset: 'aurora' },
  { max: 320, preset: 'dusk' },
  { max: 360, preset: 'ember' },
]

/** Optional preset pick when you want variety instead of a brand-tinted recipe. */
export function presetFromHex(hex: string): ArtPreset {
  const [r, g, b] = hexToRgb(hex)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === min) return 'glacier'
  const d = max - min
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60
  else if (max === g) h = ((b - r) / d + 2) * 60
  else h = ((r - g) / d + 4) * 60
  return PRESET_BY_HUE.find((entry) => h <= entry.max)?.preset ?? 'aurora'
}

/** Stable seed so the same label always paints the same fold. */
export function seedFromLabel(label: string): number {
  let h = 2166136261
  for (let i = 0; i < label.length; i++) h = Math.imul(h ^ label.charCodeAt(i), 16777619)
  return (h >>> 0) % 997
}
