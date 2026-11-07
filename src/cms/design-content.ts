import { supabase } from '../lib/supabase-client'
import {
  STYLE_SIZES,
  type StyleSize,
} from './style-tokens'

export const CMS_DESIGN_KEY = 'site_design'

export const DESIGN_FONT_OPTIONS = [
  {
    id: 'inclusive',
    label: 'Inclusive Sans',
    stack: "'Inclusive Sans', 'Segoe UI', sans-serif",
  },
  {
    id: 'inter',
    label: 'Inter',
    stack: "'Inter', 'Inclusive Sans', sans-serif",
  },
  {
    id: 'plex',
    label: 'IBM Plex Mono',
    stack: "'IBM Plex Mono', ui-monospace, monospace",
  },
] as const

export type DesignFontId = (typeof DESIGN_FONT_OPTIONS)[number]['id']

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
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asFontId(value: unknown, fallback: DesignFontId): DesignFontId {
  return DESIGN_FONT_OPTIONS.some((item) => item.id === value)
    ? (value as DesignFontId)
    : fallback
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
      titleFont: 'inclusive',
      subtitleFont: 'inclusive',
      bodyFont: 'inclusive',
      uiFont: 'inter',
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

/** CSS vars aplicadas no site e no preview */
export function designCssVars(
  payload: CmsDesignPayload,
  device: 'desktop' | 'mobile' = 'desktop',
): Record<string, string> {
  const respiro =
    device === 'mobile'
      ? RESPIRO_MOBILE_PX[payload.stage.respiroMobile]
      : RESPIRO_DESKTOP_PX[payload.stage.respiroDesktop]

  return {
    '--respiro': `${respiro}px`,
    '--stage-radius': `${STAGE_RADIUS_PX[payload.stage.radius]}px`,
    '--bg-outer': payload.stage.bgOuter,
    '--bg-stage': payload.stage.bgStage,
    '--text': payload.colors.text,
    '--muted': payload.colors.muted,
    '--font-sans': fontStack(payload.typography.titleFont),
    '--font-lead': fontStack(payload.typography.subtitleFont),
    '--font-body': fontStack(payload.typography.bodyFont),
    '--font-ui': fontStack(payload.typography.uiFont),
    '--cms-accent': payload.colors.accent,
  }
}

export function applyDesignToDocument(
  payload: CmsDesignPayload,
  device: 'desktop' | 'mobile' = 'desktop',
) {
  const root = document.documentElement
  const vars = designCssVars(payload, device)
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }
}
