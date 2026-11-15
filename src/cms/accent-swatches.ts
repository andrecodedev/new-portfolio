export const ACCENT_SWATCHES = [
  { id: 'work', label: 'Âmbar' },
  { id: 'work-deep', label: 'Âmbar fundo' },
  { id: 'work-pale', label: 'Âmbar claro' },
  { id: 'about', label: 'Verde' },
  { id: 'about-deep', label: 'Verde fundo' },
  { id: 'about-pale', label: 'Verde claro' },
  { id: 'reading', label: 'Azul' },
  { id: 'reading-deep', label: 'Azul fundo' },
  { id: 'reading-pale', label: 'Azul claro' },
  { id: 'hire', label: 'Roxo' },
  { id: 'hire-deep', label: 'Roxo fundo' },
  { id: 'hire-pale', label: 'Roxo claro' },
  { id: 'blog', label: 'Magenta' },
  { id: 'blog-deep', label: 'Magenta fundo' },
  { id: 'blog-pale', label: 'Magenta claro' },
  { id: 'contact', label: 'Vermelho' },
  { id: 'contact-deep', label: 'Vermelho fundo' },
  { id: 'contact-pale', label: 'Vermelho claro' },
  { id: 'teal', label: 'Teal' },
  { id: 'rose', label: 'Rosa' },
  { id: 'lime', label: 'Lima' },
] as const

export type AccentSwatchId = (typeof ACCENT_SWATCHES)[number]['id']

const ACCENT_IDS = new Set<string>(ACCENT_SWATCHES.map((item) => item.id))

export function isAccentSwatch(value: unknown): value is AccentSwatchId {
  return typeof value === 'string' && ACCENT_IDS.has(value)
}
