import { ASSETS, PAGE_META } from '../data/site'
import { DICTIONARIES, type Locale } from '../i18n/copy'
import { supabase } from '../lib/supabase-client'
import { isAccentSwatch, type AccentSwatchId } from './accent-swatches'

export const CMS_HERO_KEY = 'home_hero'

export type Align = 'start' | 'center' | 'end'
export type HeroAccent = AccentSwatchId

export type HeroLines = {
  titleLine1: string
  titleLine2: string
  subtitleLine1: string
  subtitleLine2: string
}

type LocaleMap<T> = Record<Locale, T>

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `mod-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function linesFromLocale(locale: Locale): HeroLines {
  const home = DICTIONARIES[locale].home
  return {
    titleLine1: home.heroTitleLines[0],
    titleLine2: home.heroTitleLines[1],
    subtitleLine1: home.heroSubtitleLines[0],
    subtitleLine2: home.heroSubtitleLines[1],
  }
}

function defaultIntroCopy(): LocaleMap<HeroLines> {
  return {
    pt: linesFromLocale('pt'),
    en: linesFromLocale('en'),
    es: linesFromLocale('es'),
  }
}

function emptyPairMap(): LocaleMap<[string, string]> {
  return { pt: ['', ''], en: ['', ''], es: ['', ''] }
}

function emptyStringMap(): LocaleMap<string> {
  return { pt: '', en: '', es: '' }
}

function emptyAccentMap(): LocaleMap<string[]> {
  return { pt: [], en: [], es: [] }
}

function defaultIntroVisible(): IntroVisible {
  return {
    titleLine1: true,
    titleLine2: true,
    subtitleLine1: true,
    subtitleLine2: true,
  }
}

function defaultLineVisible(): LineVisible {
  return {
    titleLine1: true,
    titleLine2: true,
    body: true,
    cta: true,
    image: false,
  }
}

function asBool(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

function asUrlList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0)
}

export type IntroVisible = {
  titleLine1: boolean
  titleLine2: boolean
  subtitleLine1: boolean
  subtitleLine2: boolean
}

export type DesktopTextSide = 'start' | 'end'
export type MobileAvatarPlace = 'before' | 'after'

export type IntroModule = {
  id: string
  kind: 'intro'
  enabled: boolean
  showAvatar: boolean
  gallery: string[]
  visible: IntroVisible
  desktopTextSide: DesktopTextSide
  mobileAvatar: MobileAvatarPlace
  mobileAlign: Align
  copy: LocaleMap<HeroLines>
}

export type LineVisible = {
  titleLine1: boolean
  titleLine2: boolean
  body: boolean
  cta: boolean
  image: boolean
}

export type LineButton = {
  id: string
  label: LocaleMap<string>
  to: string
}

export type LineModule = {
  id: string
  kind: 'line'
  enabled: boolean
  alignDesktop: Align
  alignMobile: Align
  accent: HeroAccent
  title: LocaleMap<[string, string]>
  body: LocaleMap<string>
  accents: LocaleMap<string[]>
  buttons: LineButton[]
  gallery: string[]
  visible: LineVisible
  imageDesktop: DesktopTextSide
  imageMobile: MobileAvatarPlace
}

export type ScrollAccent = HeroAccent | 'ink'

export type ScrollModule = {
  id: string
  kind: 'scroll'
  enabled: boolean
  label: LocaleMap<string>
  accent: ScrollAccent
  alignDesktop: Align
  alignMobile: Align
}

export type HeroModule = IntroModule | LineModule | ScrollModule

export type CmsHeroPayload = {
  version: 3
  modules: HeroModule[]
}

export function createIntroModule(
  copy: LocaleMap<HeroLines> = defaultIntroCopy(),
  showAvatar = true,
  gallery: string[] = [ASSETS.avatar],
): IntroModule {
  return {
    id: newId(),
    kind: 'intro',
    enabled: true,
    showAvatar,
    gallery,
    visible: defaultIntroVisible(),
    desktopTextSide: 'start',
    mobileAvatar: 'before',
    mobileAlign: 'center',
    copy,
  }
}

export function createBlankIntroModule() {
  const empty: HeroLines = {
    titleLine1: '',
    titleLine2: '',
    subtitleLine1: '',
    subtitleLine2: '',
  }
  return createIntroModule({ pt: empty, en: empty, es: empty }, true, [])
}

export function createLineButton(
  label: LocaleMap<string> = emptyStringMap(),
  to = PAGE_META.work.path,
): LineButton {
  return {
    id: newId(),
    label,
    to,
  }
}

export function createLineModule(): LineModule {
  return {
    id: newId(),
    kind: 'line',
    enabled: true,
    alignDesktop: 'start',
    alignMobile: 'start',
    accent: 'work',
    title: emptyPairMap(),
    body: emptyStringMap(),
    accents: emptyAccentMap(),
    buttons: [],
    gallery: [],
    visible: defaultLineVisible(),
    imageDesktop: 'end',
    imageMobile: 'after',
  }
}

export function createScrollModule(): ScrollModule {
  return {
    id: newId(),
    kind: 'scroll',
    enabled: true,
    label: { pt: 'SCROLL', en: 'SCROLL', es: 'SCROLL' },
    accent: 'ink',
    alignDesktop: 'start',
    alignMobile: 'center',
  }
}

export function defaultHeroPayload(): CmsHeroPayload {
  return {
    version: 3,
    modules: [createIntroModule(), createScrollModule()],
  }
}

function isDesktopTextSide(value: unknown): value is DesktopTextSide {
  return value === 'start' || value === 'end'
}

function isMobileAvatarPlace(value: unknown): value is MobileAvatarPlace {
  return value === 'before' || value === 'after'
}

function parseIntroVisible(value: unknown): IntroVisible {
  const fallback = defaultIntroVisible()
  if (!value || typeof value !== 'object') return fallback
  const row = value as Partial<IntroVisible>
  return {
    titleLine1: asBool(row.titleLine1, fallback.titleLine1),
    titleLine2: asBool(row.titleLine2, fallback.titleLine2),
    subtitleLine1: asBool(row.subtitleLine1, fallback.subtitleLine1),
    subtitleLine2: asBool(row.subtitleLine2, fallback.subtitleLine2),
  }
}

function parseLineVisible(value: unknown): LineVisible {
  const fallback = defaultLineVisible()
  if (!value || typeof value !== 'object') return fallback
  const row = value as Partial<LineVisible>
  return {
    titleLine1: asBool(row.titleLine1, fallback.titleLine1),
    titleLine2: asBool(row.titleLine2, fallback.titleLine2),
    body: asBool(row.body, fallback.body),
    cta: asBool(row.cta, fallback.cta),
    image: asBool(row.image, true),
  }
}

function isAlign(value: unknown): value is Align {
  return value === 'start' || value === 'center' || value === 'end'
}

function isAccent(value: unknown): value is HeroAccent {
  return isAccentSwatch(value)
}

function isScrollAccent(value: unknown): value is ScrollAccent {
  return value === 'ink' || isAccent(value)
}

function parseLineButtons(row: Record<string, unknown>): LineButton[] {
  if (Array.isArray(row.buttons)) {
    return row.buttons
      .filter((item) => item && typeof item === 'object')
      .map((item) => {
        const button = item as Record<string, unknown>
        return {
          id: typeof button.id === 'string' ? button.id : newId(),
          label: asStringMap(button.label, emptyStringMap()),
          to: typeof button.to === 'string' ? button.to : PAGE_META.work.path,
        }
      })
  }

  const label = asStringMap(row.cta, emptyStringMap())
  const to = typeof row.to === 'string' ? row.to : PAGE_META.work.path
  const hasLabel = Boolean(label.pt || label.en || label.es)
  if (!hasLabel && !row.to) return []
  return [createLineButton(label, to)]
}

function asLines(value: unknown, fallback: HeroLines): HeroLines {
  if (!value || typeof value !== 'object') return fallback
  const row = value as Partial<HeroLines>
  return {
    titleLine1: row.titleLine1 ?? fallback.titleLine1,
    titleLine2: row.titleLine2 ?? fallback.titleLine2,
    subtitleLine1: row.subtitleLine1 ?? fallback.subtitleLine1,
    subtitleLine2: row.subtitleLine2 ?? fallback.subtitleLine2,
  }
}

function asPair(value: unknown, fallback: [string, string]): [string, string] {
  if (Array.isArray(value) && value.length >= 2) {
    return [String(value[0] ?? ''), String(value[1] ?? '')]
  }
  return fallback
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

function asPairMap(
  value: unknown,
  fallback: LocaleMap<[string, string]>,
): LocaleMap<[string, string]> {
  const row =
    value && typeof value === 'object'
      ? (value as Partial<LocaleMap<unknown>>)
      : {}
  return {
    pt: asPair(row.pt, fallback.pt),
    en: asPair(row.en, fallback.en),
    es: asPair(row.es, fallback.es),
  }
}

function asAccentMap(
  value: unknown,
  fallback: LocaleMap<string[]>,
): LocaleMap<string[]> {
  const row =
    value && typeof value === 'object'
      ? (value as Partial<LocaleMap<unknown>>)
      : {}
  const list = (input: unknown, fb: string[]) =>
    Array.isArray(input) ? input.map((item) => String(item)) : fb
  return {
    pt: list(row.pt, fallback.pt),
    en: list(row.en, fallback.en),
    es: list(row.es, fallback.es),
  }
}

function parseIntroCopy(value: unknown): LocaleMap<HeroLines> {
  const fallback = defaultIntroCopy()
  if (!value || typeof value !== 'object') return fallback
  const row = value as Partial<LocaleMap<unknown>>
  return {
    pt: asLines(row.pt, fallback.pt),
    en: asLines(row.en, fallback.en),
    es: asLines(row.es, fallback.es),
  }
}

function parseIntroModule(value: unknown): IntroModule | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  if (row.kind !== 'intro') return null
  return {
    id: typeof row.id === 'string' ? row.id : newId(),
    kind: 'intro',
    enabled: row.enabled !== false,
    showAvatar: row.showAvatar !== false,
    gallery: asUrlList(row.gallery),
    visible: parseIntroVisible(row.visible),
    desktopTextSide: isDesktopTextSide(row.desktopTextSide)
      ? row.desktopTextSide
      : 'start',
    mobileAvatar: isMobileAvatarPlace(row.mobileAvatar)
      ? row.mobileAvatar
      : 'before',
    mobileAlign: isAlign(row.mobileAlign) ? row.mobileAlign : 'center',
    copy: parseIntroCopy(row.copy),
  }
}

function parseLineModule(value: unknown): LineModule | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  if (row.kind !== 'line') return null
  return {
    id: typeof row.id === 'string' ? row.id : newId(),
    kind: 'line',
    enabled: row.enabled !== false,
    alignDesktop: isAlign(row.alignDesktop) ? row.alignDesktop : 'start',
    alignMobile: isAlign(row.alignMobile) ? row.alignMobile : 'start',
    accent: isAccent(row.accent) ? row.accent : 'work',
    title: asPairMap(row.title, emptyPairMap()),
    body: asStringMap(row.body, emptyStringMap()),
    accents: asAccentMap(row.accents, emptyAccentMap()),
    buttons: parseLineButtons(row),
    gallery: asUrlList(row.gallery),
    visible: parseLineVisible(row.visible),
    imageDesktop: isDesktopTextSide(row.imageDesktop) ? row.imageDesktop : 'end',
    imageMobile: isMobileAvatarPlace(row.imageMobile) ? row.imageMobile : 'after',
  }
}

function parseScrollModule(value: unknown): ScrollModule | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  if (row.kind !== 'scroll') return null
  const fallback = createScrollModule()
  return {
    id: typeof row.id === 'string' ? row.id : newId(),
    kind: 'scroll',
    enabled: row.enabled !== false,
    label: asStringMap(row.label, fallback.label),
    accent: isScrollAccent(row.accent) ? row.accent : 'ink',
    alignDesktop: isAlign(row.alignDesktop) ? row.alignDesktop : 'start',
    alignMobile: isAlign(row.alignMobile) ? row.alignMobile : 'center',
  }
}

function parseModule(value: unknown): HeroModule | null {
  return parseIntroModule(value) ?? parseLineModule(value) ?? parseScrollModule(value)
}

function lineFromLegacyBlock(block: Record<string, unknown>): LineModule {
  const line = createLineModule()
  if (block.kind === 'title') {
    return { ...line, title: asPairMap(block.lines, emptyPairMap()) }
  }
  if (block.kind === 'description') {
    return {
      ...line,
      body: asStringMap(block.body, emptyStringMap()),
      accents: asAccentMap(block.accents, emptyAccentMap()),
    }
  }
  return {
    ...line,
    buttons: [
      createLineButton(
        asStringMap(block.label, emptyStringMap()),
        typeof block.to === 'string' ? block.to : PAGE_META.work.path,
      ),
    ],
  }
}

export const EXTERNAL_LINK_VALUE = '__external__'

export const BUTTON_TARGETS = [
  { to: '/', label: 'Home' },
  ...Object.values(PAGE_META).map((page) => ({
    to: page.path,
    label: page.id,
  })),
] as const

export function isExternalHref(to: string) {
  return /^(https?:\/\/|mailto:|tel:)/i.test(to.trim())
}

export function buttonSelectValue(to: string) {
  if (BUTTON_TARGETS.some((target) => target.to === to)) return to
  return EXTERNAL_LINK_VALUE
}

export function openHeroLink(to: string, onNavigate?: (path: string) => void) {
  const href = to.trim()
  if (!href) return
  if (isExternalHref(href)) {
    window.open(href, '_blank', 'noopener,noreferrer')
    return
  }
  if (href.startsWith('/')) onNavigate?.(href)
}

export function parseHeroPayload(payload: unknown): CmsHeroPayload {
  const fallback = defaultHeroPayload()
  if (!payload || typeof payload !== 'object') return fallback

  const row = payload as Record<string, unknown>

  if (row.version === 3 && Array.isArray(row.modules)) {
    const modules = row.modules
      .map(parseModule)
      .filter((module): module is HeroModule => module !== null)
    return {
      version: 3,
      modules,
    }
  }

  const intro = createIntroModule(
    parseIntroCopy(row.intro ?? row),
    row.showAvatar !== false,
  )

  const blocks = Array.isArray(row.blocks) ? row.blocks : []
  const lines = blocks
    .filter((item) => item && typeof item === 'object')
    .map((item) => lineFromLegacyBlock(item as Record<string, unknown>))

  return {
    version: 3,
    modules: [intro, ...lines],
  }
}

export function firstIntro(payload: CmsHeroPayload): IntroModule | undefined {
  return payload.modules.find((module): module is IntroModule => module.kind === 'intro')
}

export function heroTitleLines(data: HeroLines): [string, string] {
  return [data.titleLine1, data.titleLine2]
}

export function heroSubtitleLines(data: HeroLines): [string, string] {
  return [data.subtitleLine1, data.subtitleLine2]
}

export async function fetchHeroPayload(): Promise<CmsHeroPayload> {
  const fallback = defaultHeroPayload()
  if (!supabase) return fallback

  const { data, error } = await supabase
    .from('cms_content')
    .select('payload')
    .eq('key', CMS_HERO_KEY)
    .maybeSingle()

  if (error || !data) return fallback
  return parseHeroPayload(data.payload)
}

export async function saveHeroPayload(payload: CmsHeroPayload) {
  if (!supabase) {
    throw new Error('Supabase não configurado')
  }

  const { error } = await supabase.from('cms_content').upsert({
    key: CMS_HERO_KEY,
    payload,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error
}
