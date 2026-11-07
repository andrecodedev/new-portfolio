import { LOCALE_FLAGS, LOCALE_LABELS, LOCALES } from '../i18n/copy'
import { supabase } from '../lib/supabase-client'
import { parseSlotList } from './hero-content'
import { isSiteIconId } from './icon-registry'
import {
  defaultRainConfig,
  parseRainConfig,
  type RainConfig,
} from './rain-content'
import {
  defaultButtonStyle,
  defaultTextStyle,
  parseButtonStyle,
  parseTextStyle,
  type ButtonStyle,
  type TextStyle,
} from './style-tokens'

export type { RainConfig, RainWord } from './rain-content'
export { createRainWord } from './rain-content'

export const CMS_CHROME_KEY = 'site_chrome'

export const CHROME_BLOCK_IDS = [
  'backTop',
  'news',
  'language',
  'theme',
  'rain',
] as const

export type ChromeBlockId = (typeof CHROME_BLOCK_IDS)[number]

export type SiteLocale = {
  code: string
  label: string
  flagEmoji: string
  imageUrl: string
  enabled: boolean
  labelStyle: TextStyle
}

export type FabStyle = {
  iconId: string
  iconColor: string
  background: string
  borderColor: string
  borderWidth: number
  borderRadius: number
}

export type LangDisplayMode = 'flag' | 'image'

export type CmsChromePayload = {
  version: 2
  sectionName: string
  /** Ordem dos blocos filhos do chrome na árvore */
  blocksOrder: ChromeBlockId[]
  showBackToTop: boolean
  showNewsFab: boolean
  showLanguage: boolean
  showTheme: boolean
  backToTop: FabStyle
  newsFab: FabStyle
  themeFab: FabStyle
  languageMode: LangDisplayMode
  locales: SiteLocale[]
  sideToolsButton: ButtonStyle
  rain: RainConfig
}

export function defaultChromeBlocksOrder(): ChromeBlockId[] {
  return [...CHROME_BLOCK_IDS]
}

export function chromeHasBlock(payload: CmsChromePayload, id: ChromeBlockId) {
  return payload.blocksOrder.includes(id)
}

function asBool(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function defaultFabStyle(iconId = 'settings'): FabStyle {
  return {
    iconId,
    iconColor: '',
    background: '',
    borderColor: '',
    borderWidth: 1,
    borderRadius: 8,
  }
}

export function defaultSiteLocales(): SiteLocale[] {
  return LOCALES.map((code) => ({
    code,
    label: LOCALE_LABELS[code],
    flagEmoji: LOCALE_FLAGS[code],
    imageUrl: '',
    enabled: true,
    labelStyle: defaultTextStyle(),
  }))
}

function parseFabStyle(value: unknown, fallbackIcon: string): FabStyle {
  const fallback = defaultFabStyle(fallbackIcon)
  if (!value || typeof value !== 'object') return fallback
  const row = value as Record<string, unknown>
  const iconId = isSiteIconId(row.iconId)
    ? row.iconId
    : isSiteIconId(row.iconUrl)
      ? row.iconUrl
      : fallback.iconId
  return {
    iconId,
    iconColor: asString(row.iconColor),
    background: asString(row.background),
    borderColor: asString(row.borderColor),
    borderWidth: asNumber(row.borderWidth, fallback.borderWidth),
    borderRadius: asNumber(row.borderRadius, fallback.borderRadius),
  }
}

function parseLocale(value: unknown): SiteLocale | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const code = asString(row.code).trim().toLowerCase()
  if (!code) return null
  return {
    code,
    label: asString(row.label, code.toUpperCase()),
    flagEmoji: asString(row.flagEmoji),
    imageUrl: asString(row.imageUrl),
    enabled: asBool(row.enabled, true),
    labelStyle: parseTextStyle(row.labelStyle),
  }
}

export function defaultChromePayload(): CmsChromePayload {
  return {
    version: 2,
    sectionName: '',
    blocksOrder: defaultChromeBlocksOrder(),
    showBackToTop: true,
    showNewsFab: true,
    showLanguage: true,
    showTheme: true,
    backToTop: defaultFabStyle('arrow-up'),
    newsFab: defaultFabStyle('news'),
    themeFab: defaultFabStyle('settings'),
    languageMode: 'flag',
    locales: defaultSiteLocales(),
    sideToolsButton: defaultButtonStyle(),
    rain: defaultRainConfig(),
  }
}

export function parseChromePayload(payload: unknown): CmsChromePayload {
  const fallback = defaultChromePayload()
  if (!payload || typeof payload !== 'object') return fallback
  const row = payload as Record<string, unknown>
  const locales = Array.isArray(row.locales)
    ? row.locales
        .map(parseLocale)
        .filter((item): item is SiteLocale => item !== null)
    : fallback.locales

  const blocksOrder = parseSlotList(
    row.blocksOrder,
    CHROME_BLOCK_IDS,
    defaultChromeBlocksOrder(),
  )
  if (!blocksOrder.includes('rain')) blocksOrder.push('rain')

  return {
    version: 2,
    sectionName: asString(row.sectionName),
    blocksOrder,
    showBackToTop: asBool(row.showBackToTop, true),
    showNewsFab: asBool(row.showNewsFab, true),
    showLanguage: asBool(row.showLanguage, true),
    showTheme: asBool(row.showTheme, true),
    backToTop: parseFabStyle(row.backToTop, 'arrow-up'),
    newsFab: parseFabStyle(row.newsFab, 'news'),
    themeFab: parseFabStyle(row.themeFab, 'settings'),
    languageMode: row.languageMode === 'image' ? 'image' : 'flag',
    locales: locales.length > 0 ? locales : fallback.locales,
    sideToolsButton: parseButtonStyle(row.sideToolsButton, fallback.sideToolsButton),
    rain: parseRainConfig(row.rain),
  }
}

export function enabledLocaleCodes(payload: CmsChromePayload) {
  return payload.locales.filter((item) => item.enabled).map((item) => item.code)
}

export async function fetchChromePayload(): Promise<CmsChromePayload> {
  const fallback = defaultChromePayload()
  if (!supabase) return fallback

  const { data, error } = await supabase
    .from('cms_content')
    .select('payload')
    .eq('key', CMS_CHROME_KEY)
    .maybeSingle()

  if (error || !data) return fallback
  return parseChromePayload(data.payload)
}

export async function saveChromePayload(payload: CmsChromePayload) {
  if (!supabase) {
    throw new Error('Supabase não configurado')
  }

  const { error } = await supabase.from('cms_content').upsert({
    key: CMS_CHROME_KEY,
    payload,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error
}

export function fabStyleCss(style: FabStyle): Record<string, string> {
  const css: Record<string, string> = {}
  if (style.iconColor) css.color = style.iconColor
  if (style.background) css.background = style.background
  if (style.borderColor) css.borderColor = style.borderColor
  css.borderWidth = `${style.borderWidth}px`
  css.borderStyle = 'solid'
  css.borderRadius = `${style.borderRadius}px`
  return css
}
