import { supabase } from '../lib/supabase-client'
import {
  STYLE_SIZES,
  type StyleSize,
} from './style-tokens'

export const CMS_DESIGN_KEY = 'site_design'

export const DESIGN_FONT_OPTIONS = [
  {
    id: 'space',
    label: 'Space Grotesk',
    stack: "'Space Grotesk', 'Segoe UI', sans-serif",
  },
  {
    id: 'manrope',
    label: 'Manrope',
    stack: "'Manrope', 'Segoe UI', sans-serif",
  },
  {
    id: 'syne',
    label: 'Syne',
    stack: "'Syne', 'Segoe UI', sans-serif",
  },
  {
    id: 'jetbrains',
    label: 'JetBrains Mono',
    stack: "'JetBrains Mono', ui-monospace, monospace",
  },
] as const

export type DesignFontId = (typeof DESIGN_FONT_OPTIONS)[number]['id']

export const DESIGN_ICON_STYLES = [
  { id: 'tile', label: 'Com fundo' },
  { id: 'plain', label: 'Só traço' },
] as const

export type DesignIconStyle = (typeof DESIGN_ICON_STYLES)[number]['id']

export const DESIGN_ICON_WEIGHTS = [
  { id: 'regular', label: 'Regular' },
  { id: 'bold', label: 'Bold' },
] as const

export type DesignIconWeight = (typeof DESIGN_ICON_WEIGHTS)[number]['id']

/** Valores reais por preset — o usuário só escolhe menor / padrão / maior */
export const RESPIRO_DESKTOP_PX: Record<StyleSize, number> = {
  sm: 8,
  md: 18,
  lg: 32,
}

export const RESPIRO_MOBILE_PX: Record<StyleSize, number> = {
  sm: 6,
  md: 12,
  lg: 22,
}

export const STAGE_RADIUS_PX: Record<StyleSize, number> = {
  sm: 0,
  md: 5,
  lg: 14,
}

export const ICON_TILE_WASH: Record<StyleSize, string> = {
  sm: '8%',
  md: '12%',
  lg: '18%',
}

export const ICON_TILE_RADIUS_PX: Record<StyleSize, number> = {
  sm: 6,
  md: 10,
  lg: 14,
}

export const ICON_STROKE: Record<DesignIconWeight, string> = {
  regular: '1.65',
  bold: '2.15',
}

export type CmsDesignPayload = {
  version: 1
  sectionName: string
  stage: {
    respiroDesktop: StyleSize
    respiroMobile: StyleSize
    radius: StyleSize
    bgOuter: string
    bgStage: string
  }
  colors: {
    text: string
    muted: string
    accent: string
  }
  typography: {
    titleFont: DesignFontId
    subtitleFont: DesignFontId
    bodyFont: DesignFontId
    uiFont: DesignFontId
  }
  icons: {
    style: DesignIconStyle
    weight: DesignIconWeight
    wash: StyleSize
    radius: StyleSize
  }
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asFontId(value: unknown, fallback: DesignFontId): DesignFontId {
  return DESIGN_FONT_OPTIONS.some((item) => item.id === value)
    ? (value as DesignFontId)
    : fallback
}

function asIconStyle(
  value: unknown,
  fallback: DesignIconStyle,
): DesignIconStyle {
  return value === 'tile' || value === 'plain' ? value : fallback
}

function asIconWeight(
  value: unknown,
  fallback: DesignIconWeight,
): DesignIconWeight {
  return value === 'regular' || value === 'bold' ? value : fallback
}

function fontStack(id: DesignFontId) {
  return (
    DESIGN_FONT_OPTIONS.find((item) => item.id === id)?.stack ??
    DESIGN_FONT_OPTIONS[0].stack
  )
}

function nearestSize(px: number, map: Record<StyleSize, number>): StyleSize {
  let best: StyleSize = 'md'
  let bestDiff = Number.POSITIVE_INFINITY
  for (const size of STYLE_SIZES) {
    const diff = Math.abs(map[size] - px)
    if (diff < bestDiff) {
      best = size
      bestDiff = diff
    }
  }
  return best
}

function asStyleSize(
  value: unknown,
  fallback: StyleSize,
  legacyMap?: Record<StyleSize, number>,
): StyleSize {
  if (value === 'sm' || value === 'md' || value === 'lg') return value
  if (typeof value === 'number' && Number.isFinite(value) && legacyMap) {
    return nearestSize(value, legacyMap)
  }
  return fallback
}

export function defaultDesignPayload(): CmsDesignPayload {
  return {
    version: 1,
    sectionName: '',
    stage: {
      respiroDesktop: 'md',
      respiroMobile: 'md',
      radius: 'md',
      bgOuter: '#0a0a0a',
      bgStage: '#1c1c1c',
    },
    colors: {
      text: '#f2f2f2',
      muted: '#b8b8b8',
      accent: '#f0d45c',
    },
    typography: {
      // Syne = display com cara própria (Space Grotesk/Manrope ficam “Arial demais”).
      titleFont: 'syne',
      subtitleFont: 'space',
      bodyFont: 'manrope',
      uiFont: 'jetbrains',
    },
    icons: {
      style: 'plain',
      weight: 'regular',
      wash: 'md',
      radius: 'md',
    },
  }
}

export function parseDesignPayload(payload: unknown): CmsDesignPayload {
  const fallback = defaultDesignPayload()
  if (!payload || typeof payload !== 'object') return fallback
  const row = payload as Record<string, unknown>
  const stage =
    row.stage && typeof row.stage === 'object'
      ? (row.stage as Record<string, unknown>)
      : {}
  const colors =
    row.colors && typeof row.colors === 'object'
      ? (row.colors as Record<string, unknown>)
      : {}
  const typography =
    row.typography && typeof row.typography === 'object'
      ? (row.typography as Record<string, unknown>)
      : {}
  const icons =
    row.icons && typeof row.icons === 'object'
      ? (row.icons as Record<string, unknown>)
      : {}

  return {
    version: 1,
    sectionName: asString(row.sectionName),
    stage: {
      respiroDesktop: asStyleSize(
        stage.respiroDesktop,
        fallback.stage.respiroDesktop,
        RESPIRO_DESKTOP_PX,
      ),
      respiroMobile: asStyleSize(
        stage.respiroMobile,
        fallback.stage.respiroMobile,
        RESPIRO_MOBILE_PX,
      ),
      radius: asStyleSize(stage.radius, fallback.stage.radius, STAGE_RADIUS_PX),
      bgOuter:
        asString(stage.bgOuter, fallback.stage.bgOuter) || fallback.stage.bgOuter,
      bgStage:
        asString(stage.bgStage, fallback.stage.bgStage) || fallback.stage.bgStage,
    },
    colors: {
      text: asString(colors.text, fallback.colors.text) || fallback.colors.text,
      muted:
        asString(colors.muted, fallback.colors.muted) || fallback.colors.muted,
      accent:
        asString(colors.accent, fallback.colors.accent) ||
        fallback.colors.accent,
    },
    typography: {
      titleFont: asFontId(typography.titleFont, fallback.typography.titleFont),
      subtitleFont: asFontId(
        typography.subtitleFont,
        fallback.typography.subtitleFont,
      ),
      bodyFont: asFontId(typography.bodyFont, fallback.typography.bodyFont),
      uiFont: asFontId(typography.uiFont, fallback.typography.uiFont),
    },
    icons: {
      style: asIconStyle(icons.style, fallback.icons.style),
      weight: asIconWeight(icons.weight, fallback.icons.weight),
      wash: asStyleSize(icons.wash, fallback.icons.wash),
      radius: asStyleSize(
        icons.radius,
        fallback.icons.radius,
        ICON_TILE_RADIUS_PX,
      ),
    },
  }
}

export async function fetchDesignPayload(): Promise<CmsDesignPayload> {
  const fallback = defaultDesignPayload()
  if (!supabase) return fallback

  const { data, error } = await supabase
    .from('cms_content')
    .select('payload')
    .eq('key', CMS_DESIGN_KEY)
    .maybeSingle()

  if (error || !data) return fallback
  return parseDesignPayload(data.payload)
}

export async function saveDesignPayload(payload: CmsDesignPayload) {
  if (!supabase) {
    throw new Error('Supabase não configurado')
  }

  const { error } = await supabase.from('cms_content').upsert({
    key: CMS_DESIGN_KEY,
    payload,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error
}

const DESIGN_INLINE_KEYS = [
  '--respiro',
  '--stage-radius',
  '--bg-outer',
  '--bg-stage',
  '--text',
  '--muted',
  '--font-sans',
  '--font-lead',
  '--font-body',
  '--font-ui',
  '--font-mono',
  '--cms-accent',
  '--icon-tile-wash',
  '--icon-tile-radius',
  '--icon-stroke',
  '--icon-glyph-scale',
] as const

function toCssDecls(vars: Record<string, string>) {
  return Object.entries(vars)
    .map(([key, value]) => `${key}:${value};`)
    .join('')
}

/** Espaçamento + tipografia — válidos em qualquer tema */
export function designStructuralCssVars(
  payload: CmsDesignPayload,
  device: 'desktop' | 'mobile' = 'desktop',
): Record<string, string> {
  const respiro =
    device === 'mobile'
      ? RESPIRO_MOBILE_PX[payload.stage.respiroMobile]
      : RESPIRO_DESKTOP_PX[payload.stage.respiroDesktop]

  const ui = fontStack(payload.typography.uiFont)
  const tiled = payload.icons.style === 'tile'
  return {
    '--respiro': `${respiro}px`,
    '--stage-radius': `${STAGE_RADIUS_PX[payload.stage.radius]}px`,
    '--font-sans': fontStack(payload.typography.titleFont),
    '--font-lead': fontStack(payload.typography.subtitleFont),
    '--font-body': fontStack(payload.typography.bodyFont),
    '--font-ui': ui,
    '--font-mono': ui,
    '--icon-tile-wash': tiled ? ICON_TILE_WASH[payload.icons.wash] : '0%',
    '--icon-tile-radius': tiled
      ? `${ICON_TILE_RADIUS_PX[payload.icons.radius]}px`
      : '0px',
    '--icon-stroke': ICON_STROKE[payload.icons.weight],
    '--icon-glyph-scale': tiled ? '0.55' : '1',
  }
}

/**
 * Cores do CMS = tema escuro.
 * Não podem ir em :root/inline, senão atropelam [data-theme='light'].
 */
export function designDarkThemeCssVars(
  payload: CmsDesignPayload,
): Record<string, string> {
  return {
    '--bg-outer': payload.stage.bgOuter,
    '--bg-stage': payload.stage.bgStage,
    '--text': payload.colors.text,
    '--muted': payload.colors.muted,
    '--cms-accent': payload.colors.accent,
  }
}

/** Preview do admin: tudo junto no canvas (sem conflito de tema do site). */
export function designCssVars(
  payload: CmsDesignPayload,
  device: 'desktop' | 'mobile' = 'desktop',
): Record<string, string> {
  return {
    ...designStructuralCssVars(payload, device),
    ...designDarkThemeCssVars(payload),
  }
}

/** Stylesheet do site público — cores só no escuro. */
export function buildDesignStyleSheet(payload: CmsDesignPayload): string {
  const desktop = designStructuralCssVars(payload, 'desktop')
  const mobile = designStructuralCssVars(payload, 'mobile')
  const dark = designDarkThemeCssVars(payload)

  return [
    `:root{${toCssDecls(desktop)}}`,
    `:root:not([data-theme="light"]),[data-theme="dark"]{${toCssDecls(dark)}}`,
    `@media (max-width:1023px){:root{--respiro:${mobile['--respiro']};}}`,
  ].join('')
}

/** Limpa overrides inline antigos que bloqueavam a troca de tema. */
export function clearDesignInlineStyles() {
  const root = document.documentElement
  for (const key of DESIGN_INLINE_KEYS) {
    root.style.removeProperty(key)
  }
}
