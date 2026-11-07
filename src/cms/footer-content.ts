import { DICTIONARIES } from '../i18n/copy'
import { supabase } from '../lib/supabase-client'
import { parseSlotList } from './hero-content'
import {
  defaultTextStyle,
  parseTextStyle,
  type TextStyle,
} from './style-tokens'

export const CMS_FOOTER_KEY = 'site_footer'

type LocaleMap = Record<string, string>

export const FOOTER_SLOT_IDS = ['line1', 'line2'] as const

export type FooterSlotId = (typeof FOOTER_SLOT_IDS)[number]

export type CmsFooterPayload = {
  version: 2
  sectionName: string
  enabled: boolean
  slots: FooterSlotId[]
  line1: LocaleMap
  line2: LocaleMap
  showLine1: boolean
  showLine2: boolean
  line1Style: TextStyle
  line2Style: TextStyle
}

function asBool(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

function asStringMap(value: unknown, fallback: LocaleMap): LocaleMap {
  const next = { ...fallback }
  if (!value || typeof value !== 'object') return next
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (typeof val === 'string') next[key] = val
  }
  return next
}

export function defaultFooterSlots(): FooterSlotId[] {
  return [...FOOTER_SLOT_IDS]
}

export function footerHasSlot(payload: CmsFooterPayload, slot: FooterSlotId) {
  return payload.slots.includes(slot)
}

export function defaultFooterPayload(): CmsFooterPayload {
  return {
    version: 2,
    sectionName: '',
    enabled: true,
    slots: defaultFooterSlots(),
    line1: {
      pt: DICTIONARIES.pt.chrome.copyrightLine1,
      en: DICTIONARIES.en.chrome.copyrightLine1,
      es: DICTIONARIES.es.chrome.copyrightLine1,
    },
    line2: {
      pt: DICTIONARIES.pt.chrome.copyrightLine2,
      en: DICTIONARIES.en.chrome.copyrightLine2,
      es: DICTIONARIES.es.chrome.copyrightLine2,
    },
    showLine1: true,
    showLine2: true,
    line1Style: defaultTextStyle(),
    line2Style: defaultTextStyle(),
  }
}

export function parseFooterPayload(payload: unknown): CmsFooterPayload {
  const fallback = defaultFooterPayload()
  if (!payload || typeof payload !== 'object') return fallback
  const row = payload as Record<string, unknown>
  return {
    version: 2,
    sectionName: typeof row.sectionName === 'string' ? row.sectionName : '',
    enabled: asBool(row.enabled, true),
    slots: parseSlotList(row.slots, FOOTER_SLOT_IDS, defaultFooterSlots()),
    line1: asStringMap(row.line1, fallback.line1),
    line2: asStringMap(row.line2, fallback.line2),
    showLine1: asBool(row.showLine1, true),
    showLine2: asBool(row.showLine2, true),
    line1Style: parseTextStyle(row.line1Style, fallback.line1Style),
    line2Style: parseTextStyle(row.line2Style, fallback.line2Style),
  }
}

export async function fetchFooterPayload(): Promise<CmsFooterPayload> {
  const fallback = defaultFooterPayload()
  if (!supabase) return fallback

  const { data, error } = await supabase
    .from('cms_content')
    .select('payload')
    .eq('key', CMS_FOOTER_KEY)
    .maybeSingle()

  if (error || !data) return fallback
  return parseFooterPayload(data.payload)
}

export async function saveFooterPayload(payload: CmsFooterPayload) {
  if (!supabase) {
    throw new Error('Supabase não configurado')
  }

  const { error } = await supabase.from('cms_content').upsert({
    key: CMS_FOOTER_KEY,
    payload,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error
}
