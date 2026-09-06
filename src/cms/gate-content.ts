import { ASSETS, PAGE_META } from '../data/site'
import { DICTIONARIES, type Locale } from '../i18n/copy'
import { supabase } from '../lib/supabase-client'
import { isAccentSwatch, type AccentSwatchId } from './accent-swatches'

export const CMS_GATE_KEY = 'home_gate'

type LocaleMap<T> = Record<Locale, T>

export type GateAccent = AccentSwatchId
export type GateMediaKind = 'image' | 'video'

export type GateButton = {
  id: string
  label: LocaleMap<string>
  to: string
}

export type GateSlide = {
  id: string
  enabled: boolean
  accent: GateAccent
  mediaKind: GateMediaKind
  mediaUrl: string
  imageAlt: LocaleMap<string>
  kicker: LocaleMap<string>
  title: LocaleMap<string>
  body: LocaleMap<string>
  buttons: GateButton[]
}

export type CmsGatePayload = {
  version: 1
  slides: GateSlide[]
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `gate-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function emptyMap(): LocaleMap<string> {
  return { pt: '', en: '', es: '' }
}

function asStringMap(
  value: unknown,
  fallback: LocaleMap<string>,
): LocaleMap<string> {
  const row =
    value && typeof value === 'object' ? (value as Partial<LocaleMap<string>>) : {}
  return {
    pt: row.pt ?? fallback.pt,
    en: row.en ?? fallback.en,
    es: row.es ?? fallback.es,
  }
}

export function createGateButton(
  label: LocaleMap<string> = emptyMap(),
  to = PAGE_META.hire.path,
): GateButton {
  return { id: newId(), label, to }
}

export function createGateSlide(): GateSlide {
  return {
    id: newId(),
    enabled: true,
    accent: 'hire',
    mediaKind: 'image',
    mediaUrl: '',
    imageAlt: emptyMap(),
    kicker: emptyMap(),
    title: emptyMap(),
    body: emptyMap(),
    buttons: [createGateButton()],
  }
}

export function defaultGatePayload(): CmsGatePayload {
  const pt = DICTIONARIES.pt.gate
  const en = DICTIONARIES.en.gate
  const es = DICTIONARIES.es.gate

  return {
    version: 1,
    slides: [
      {
        id: newId(),
        enabled: true,
        accent: 'hire',
        mediaKind: 'video',
        mediaUrl: ASSETS.hireVideo,
        imageAlt: {
          pt: DICTIONARIES.pt.pages.hire.imageAlt,
          en: DICTIONARIES.en.pages.hire.imageAlt,
          es: DICTIONARIES.es.pages.hire.imageAlt,
        },
        kicker: { pt: pt.hireKicker, en: en.hireKicker, es: es.hireKicker },
        title: { pt: pt.hireTitle, en: en.hireTitle, es: es.hireTitle },
        body: { pt: pt.hireBody, en: en.hireBody, es: es.hireBody },
        buttons: [
          createGateButton(
            { pt: pt.hireCta, en: en.hireCta, es: es.hireCta },
            PAGE_META.hire.path,
          ),
        ],
      },
      {
        id: newId(),
        enabled: true,
        accent: 'reading',
        mediaKind: 'image',
        mediaUrl: ASSETS.youtubeChannel,
        imageAlt: {
          pt: pt.youtubeTitle,
          en: en.youtubeTitle,
          es: es.youtubeTitle,
        },
        kicker: {
          pt: pt.youtubeKicker,
          en: en.youtubeKicker,
          es: es.youtubeKicker,
        },
        title: { pt: pt.youtubeTitle, en: en.youtubeTitle, es: es.youtubeTitle },
        body: { pt: pt.youtubeBody, en: en.youtubeBody, es: es.youtubeBody },
        buttons: [
          createGateButton(
            { pt: pt.youtubeCta, en: en.youtubeCta, es: es.youtubeCta },
            'https://www.youtube.com/@TagAberta',
          ),
          createGateButton(
            {
              pt: pt.youtubeStudiesCta,
              en: en.youtubeStudiesCta,
              es: es.youtubeStudiesCta,
            },
            PAGE_META.reading.path,
          ),
        ],
      },
    ],
  }
}

function parseButtons(value: unknown): GateButton[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const row = item as Record<string, unknown>
      return {
        id: typeof row.id === 'string' ? row.id : newId(),
        label: asStringMap(row.label, emptyMap()),
        to: typeof row.to === 'string' ? row.to : PAGE_META.hire.path,
      }
    })
}

function parseSlide(value: unknown): GateSlide | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const fallback = createGateSlide()
  const mediaKind = row.mediaKind === 'video' ? 'video' : 'image'
  return {
    id: typeof row.id === 'string' ? row.id : newId(),
    enabled: row.enabled !== false,
    accent: isAccentSwatch(row.accent) ? row.accent : 'hire',
    mediaKind,
    mediaUrl: typeof row.mediaUrl === 'string' ? row.mediaUrl : '',
    imageAlt: asStringMap(row.imageAlt, fallback.imageAlt),
    kicker: asStringMap(row.kicker, fallback.kicker),
    title: asStringMap(row.title, fallback.title),
    body: asStringMap(row.body, fallback.body),
    buttons: parseButtons(row.buttons),
  }
}

export function parseGatePayload(payload: unknown): CmsGatePayload {
  const fallback = defaultGatePayload()
  if (!payload || typeof payload !== 'object') return fallback
  const row = payload as Record<string, unknown>
  if (!Array.isArray(row.slides)) return fallback
  const slides = row.slides
    .map(parseSlide)
    .filter((slide): slide is GateSlide => slide !== null)
  return { version: 1, slides: slides.length > 0 ? slides : fallback.slides }
}

function looksLikeVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)
}

function looksLikeImageUrl(url: string) {
  return /\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i.test(url)
}

export function slideToView(slide: GateSlide, locale: Locale) {
  const mediaUrl = slide.mediaUrl.trim()
  const video =
    slide.mediaKind === 'video' && mediaUrl && !looksLikeImageUrl(mediaUrl)
      ? mediaUrl
      : undefined
  const image =
    slide.mediaKind === 'image' && mediaUrl && !looksLikeVideoUrl(mediaUrl)
      ? mediaUrl
      : undefined

  return {
    id: slide.id,
    accent: slide.accent,
    video,
    image,
    imageAlt: slide.imageAlt[locale],
    kicker: slide.kicker[locale],
    title: slide.title[locale],
    body: slide.body[locale],
    buttons: slide.buttons
      .map((button) => ({
        id: button.id,
        label: button.label[locale].trim(),
        to: button.to,
      }))
      .filter((button) => button.label.length > 0),
  }
}

export async function fetchGatePayload(): Promise<CmsGatePayload> {
  const fallback = defaultGatePayload()
  if (!supabase) return fallback

  const { data, error } = await supabase
    .from('cms_content')
    .select('payload')
    .eq('key', CMS_GATE_KEY)
    .maybeSingle()

  if (error || !data) return fallback
  return parseGatePayload(data.payload)
}

export async function saveGatePayload(payload: CmsGatePayload) {
  if (!supabase) {
    throw new Error('Supabase não configurado')
  }

  const { error } = await supabase.from('cms_content').upsert({
    key: CMS_GATE_KEY,
    payload,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error
}
