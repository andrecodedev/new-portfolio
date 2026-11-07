import { ASSETS, PAGE_META, SOCIAL_LINKS } from '../data/site'
import { DICTIONARIES, type Locale } from '../i18n/copy'
import { supabase } from '../lib/supabase-client'
import { isSiteIconId } from './icon-registry'
import {
  defaultButtonStyle,
  defaultTextStyle,
  parseButtonStyle,
  parseTextStyle,
  type ButtonStyle,
  type TextStyle,
} from './style-tokens'

export const CMS_HEADER_KEY = 'site_header'

type LocaleMap<T> = Record<string, T>

export type HeaderNavItem = {
  id: string
  name: string
  enabled: boolean
  path: string
  label: LocaleMap<string>
  description: LocaleMap<string>
  accents: LocaleMap<string[]>
  accent: string | null
  imageUrl: string
  labelStyle: TextStyle
  descriptionStyle: TextStyle
}

export type HeaderSocial = {
  id: string
  name: string
  enabled: boolean
  label: string
  href: string
  iconId: string
  labelStyle: TextStyle
}

/** Estilos globais do bloco pai Cabeçalho. Vazio = CSS do site. */
export type HeaderChromeStyle = {
  background: string
  textColor: string
  iconColor: string
  paddingY: number
  paddingX: number
}

export type HeaderGroupStyle = {
  textColor: string
  iconColor: string
  textStyle: TextStyle
}

export const HEADER_MODULE_IDS = [
  'logo',
  'menu',
  'cta',
  'nav',
  'social',
] as const

export type HeaderModuleId = (typeof HEADER_MODULE_IDS)[number]

export type CmsHeaderPayload = {
  version: 3
  sectionName: string
  chromeStyle: HeaderChromeStyle
  /** Ordem dos blocos filhos do cabeçalho na árvore */
  modulesOrder: HeaderModuleId[]
  logoUrl: string
  logoHeight: number
  logoEnabled: boolean
  menuEnabled: boolean
  menuOpen: LocaleMap<string>
  menuClose: LocaleMap<string>
  menuOpenStyle: TextStyle
  menuCloseStyle: TextStyle
  ctaEnabled: boolean
  ctaLabel: LocaleMap<string>
  ctaLabelStyle: TextStyle
  ctaButtonStyle: ButtonStyle
  ctaIconId: string
  ctaTo: string
  navGroupStyle: HeaderGroupStyle
  socialGroupStyle: HeaderGroupStyle
  navItems: HeaderNavItem[]
  socials: HeaderSocial[]
}

export function defaultHeaderModulesOrder(): HeaderModuleId[] {
  return [...HEADER_MODULE_IDS]
}

export function parseHeaderModulesOrder(value: unknown): HeaderModuleId[] {
  const fallback = defaultHeaderModulesOrder()
  if (!Array.isArray(value)) return fallback
  const allowed = new Set<string>(HEADER_MODULE_IDS)
  const seen = new Set<string>()
  const ordered: HeaderModuleId[] = []
  for (const entry of value) {
    if (typeof entry !== 'string' || !allowed.has(entry) || seen.has(entry)) {
      continue
    }
    seen.add(entry)
    ordered.push(entry as HeaderModuleId)
  }
  for (const id of fallback) {
    if (!seen.has(id)) ordered.push(id)
  }
  return ordered
}

export function defaultHeaderChromeStyle(): HeaderChromeStyle {
  return {
    background: '',
    textColor: '',
    iconColor: '',
    paddingY: 0,
    paddingX: 0,
  }
}

export function defaultHeaderGroupStyle(): HeaderGroupStyle {
  return {
    textColor: '',
    iconColor: '',
    textStyle: defaultTextStyle(),
  }
}

function asNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function parseChromeStyle(value: unknown): HeaderChromeStyle {
  const fallback = defaultHeaderChromeStyle()
  if (!value || typeof value !== 'object') return fallback
  const row = value as Record<string, unknown>
  return {
    background: asString(row.background),
    textColor: asString(row.textColor),
    iconColor: asString(row.iconColor),
    paddingY: asNumber(row.paddingY, 0),
    paddingX: asNumber(row.paddingX, 0),
  }
}

function parseGroupStyle(value: unknown): HeaderGroupStyle {
  const fallback = defaultHeaderGroupStyle()
  if (!value || typeof value !== 'object') return fallback
  const row = value as Record<string, unknown>
  return {
    textColor: asString(row.textColor),
    iconColor: asString(row.iconColor),
    textStyle: parseTextStyle(row.textStyle, fallback.textStyle),
  }
}

/** CSS vars / inline para o bloco pai — só aplica o que estiver preenchido. */
export function headerChromeCss(
  style: HeaderChromeStyle,
): Record<string, string> {
  const css: Record<string, string> = {}
  if (style.background) css['--header-bg'] = style.background
  if (style.textColor) css['--header-text'] = style.textColor
  if (style.iconColor) css['--header-icon-color'] = style.iconColor
  if (style.paddingY > 0) css['--header-pad-y'] = `${style.paddingY}px`
  if (style.paddingX > 0) css['--header-pad-x'] = `${style.paddingX}px`
  return css
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `hdr-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function emptyStringMap(): LocaleMap<string> {
  return { pt: '', en: '', es: '' }
}

function emptyAccentMap(): LocaleMap<string[]> {
  return { pt: [], en: [], es: [] }
}

function asBool(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asStringMap(
  value: unknown,
  fallback: LocaleMap<string>,
): LocaleMap<string> {
  const next: LocaleMap<string> = { ...fallback }
  if (!value || typeof value !== 'object') return next
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (typeof val === 'string') next[key] = val
  }
  return next
}

function asAccentMap(
  value: unknown,
  fallback: LocaleMap<string[]>,
): LocaleMap<string[]> {
  const next: LocaleMap<string[]> = { ...fallback }
  if (!value || typeof value !== 'object') return next
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!Array.isArray(raw)) continue
    next[key] = raw
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
  }
  return next
}

function localeChrome(locale: Locale) {
  return DICTIONARIES[locale].chrome
}

function pageMenu(locale: Locale, page: keyof typeof PAGE_META) {
  return DICTIONARIES[locale].pages[page]
}

export function createHeaderNavItem(
  partial?: Partial<HeaderNavItem>,
): HeaderNavItem {
  return {
    id: newId(),
    name: '',
    enabled: true,
    path: '/',
    label: emptyStringMap(),
    description: emptyStringMap(),
    accents: emptyAccentMap(),
    accent: null,
    imageUrl: '',
    labelStyle: defaultTextStyle(),
    descriptionStyle: defaultTextStyle(),
    ...partial,
  }
}

export function createHeaderSocial(
  partial?: Partial<HeaderSocial>,
): HeaderSocial {
  return {
    id: newId(),
    name: '',
    enabled: true,
    label: '',
    href: '',
    iconId: 'external',
    labelStyle: defaultTextStyle(),
    ...partial,
  }
}

export function defaultHeaderPayload(): CmsHeaderPayload {
  const navHome = {
    pt: DICTIONARIES.pt.navHome,
    en: DICTIONARIES.en.navHome,
    es: DICTIONARIES.es.navHome,
  }

  return {
    version: 3,
    sectionName: '',
    chromeStyle: defaultHeaderChromeStyle(),
    modulesOrder: defaultHeaderModulesOrder(),
    logoUrl: ASSETS.logo,
    logoHeight: 0,
    logoEnabled: true,
    menuEnabled: true,
    menuOpen: {
      pt: localeChrome('pt').menu,
      en: localeChrome('en').menu,
      es: localeChrome('es').menu,
    },
    menuClose: {
      pt: localeChrome('pt').close,
      en: localeChrome('en').close,
      es: localeChrome('es').close,
    },
    menuOpenStyle: defaultTextStyle(),
    menuCloseStyle: defaultTextStyle(),
    ctaEnabled: true,
    ctaLabel: {
      pt: localeChrome('pt').hireMe,
      en: localeChrome('en').hireMe,
      es: localeChrome('es').hireMe,
    },
    ctaLabelStyle: defaultTextStyle(),
    ctaButtonStyle: defaultButtonStyle(),
    ctaIconId: 'chat',
    ctaTo: PAGE_META.contact.path,
    navGroupStyle: defaultHeaderGroupStyle(),
    socialGroupStyle: defaultHeaderGroupStyle(),
    navItems: [
      createHeaderNavItem({
        name: 'Home',
        path: '/',
        label: {
          pt: navHome.pt.label,
          en: navHome.en.label,
          es: navHome.es.label,
        },
        description: {
          pt: navHome.pt.description,
          en: navHome.en.description,
          es: navHome.es.description,
        },
        accents: {
          pt: [...navHome.pt.accents],
          en: [...navHome.en.accents],
          es: [...navHome.es.accents],
        },
        accent: null,
        imageUrl: ASSETS.home,
      }),
      createHeaderNavItem({
        name: 'Trabalhos',
        path: PAGE_META.work.path,
        label: {
          pt: pageMenu('pt', 'work').menuLabel,
          en: pageMenu('en', 'work').menuLabel,
          es: pageMenu('es', 'work').menuLabel,
        },
        description: {
          pt: pageMenu('pt', 'work').menuDescription,
          en: pageMenu('en', 'work').menuDescription,
          es: pageMenu('es', 'work').menuDescription,
        },
        accents: {
          pt: [...pageMenu('pt', 'work').menuAccents],
          en: [...pageMenu('en', 'work').menuAccents],
          es: [...pageMenu('es', 'work').menuAccents],
        },
        accent: 'work',
        imageUrl: PAGE_META.work.image,
      }),
      createHeaderNavItem({
        name: 'Sobre',
        path: PAGE_META.about.path,
        label: {
          pt: pageMenu('pt', 'about').menuLabel,
          en: pageMenu('en', 'about').menuLabel,
          es: pageMenu('es', 'about').menuLabel,
        },
        description: {
          pt: pageMenu('pt', 'about').menuDescription,
          en: pageMenu('en', 'about').menuDescription,
          es: pageMenu('es', 'about').menuDescription,
        },
        accents: {
          pt: [...pageMenu('pt', 'about').menuAccents],
          en: [...pageMenu('en', 'about').menuAccents],
          es: [...pageMenu('es', 'about').menuAccents],
        },
        accent: 'about',
        imageUrl: PAGE_META.about.image,
      }),
      createHeaderNavItem({
        name: 'Leituras',
        path: PAGE_META.reading.path,
        label: {
          pt: pageMenu('pt', 'reading').menuLabel,
          en: pageMenu('en', 'reading').menuLabel,
          es: pageMenu('es', 'reading').menuLabel,
        },
        description: {
          pt: pageMenu('pt', 'reading').menuDescription,
          en: pageMenu('en', 'reading').menuDescription,
          es: pageMenu('es', 'reading').menuDescription,
        },
        accents: {
          pt: [...pageMenu('pt', 'reading').menuAccents],
          en: [...pageMenu('en', 'reading').menuAccents],
          es: [...pageMenu('es', 'reading').menuAccents],
        },
        accent: 'reading',
        imageUrl: PAGE_META.reading.image,
      }),
      createHeaderNavItem({
        name: 'Contrato',
        path: PAGE_META.hire.path,
        label: {
          pt: pageMenu('pt', 'hire').menuLabel,
          en: pageMenu('en', 'hire').menuLabel,
          es: pageMenu('es', 'hire').menuLabel,
        },
        description: {
          pt: pageMenu('pt', 'hire').menuDescription,
          en: pageMenu('en', 'hire').menuDescription,
          es: pageMenu('es', 'hire').menuDescription,
        },
        accents: {
          pt: [...pageMenu('pt', 'hire').menuAccents],
          en: [...pageMenu('en', 'hire').menuAccents],
          es: [...pageMenu('es', 'hire').menuAccents],
        },
        accent: 'hire',
        imageUrl: PAGE_META.hire.image,
      }),
      createHeaderNavItem({
        name: 'Contato',
        path: PAGE_META.contact.path,
        label: {
          pt: pageMenu('pt', 'contact').menuLabel,
          en: pageMenu('en', 'contact').menuLabel,
          es: pageMenu('es', 'contact').menuLabel,
        },
        description: {
          pt: pageMenu('pt', 'contact').menuDescription,
          en: pageMenu('en', 'contact').menuDescription,
          es: pageMenu('es', 'contact').menuDescription,
        },
        accents: {
          pt: [...pageMenu('pt', 'contact').menuAccents],
          en: [...pageMenu('en', 'contact').menuAccents],
          es: [...pageMenu('es', 'contact').menuAccents],
        },
        accent: 'contact',
        imageUrl: PAGE_META.contact.image,
      }),
    ],
    socials: SOCIAL_LINKS.map((item) =>
      createHeaderSocial({
        name: item.label,
        label: item.label,
        href: item.href,
        iconId: socialIconIdFromLabel(item.label, item.href),
      }),
    ),
  }
}

function socialIconIdFromLabel(label: string, href = '') {
  const key = `${label} ${href}`.toLowerCase()
  if (key.includes('git')) return 'github'
  if (key.includes('linked')) return 'linkedin'
  if (key.includes('insta')) return 'instagram'
  if (key.includes('youtube') || key.includes('youtu')) return 'youtube'
  if (key.includes('mail') || key.includes('email') || key.includes('mailto'))
    return 'mail'
  if (key.includes('hire') || key.includes('contat') || key.includes('chat'))
    return 'chat'
  return 'external'
}

/** Recupera ícone a partir de URL antiga de asset (/email.png, etc.). */
function iconIdFromAssetPath(path: string) {
  const file = path.toLowerCase().split('/').pop() ?? ''
  if (file.includes('git')) return 'github'
  if (file.includes('linked')) return 'linkedin'
  if (file.includes('insta')) return 'instagram'
  if (file.includes('youtube') || file.includes('youtu')) return 'youtube'
  if (file.includes('mail') || file.includes('email')) return 'mail'
  if (file.includes('hire') || file.includes('contat') || file.includes('chat'))
    return 'chat'
  return null
}

/**
 * Resolve ícone do registry.
 * Se o salvo for o genérico `external` (migração antiga), tenta inferir de novo.
 */
function resolveSiteIconId(
  iconId: unknown,
  hintPath = '',
  label = '',
  href = '',
  fallback = 'external',
) {
  const inferred =
    iconIdFromAssetPath(hintPath) ||
    socialIconIdFromLabel(label, `${href} ${hintPath}`)

  if (isSiteIconId(iconId) && iconId !== 'external') return iconId
  if (inferred !== 'external') return inferred
  if (isSiteIconId(iconId)) return iconId
  return isSiteIconId(fallback) ? fallback : 'external'
}

function parseNavItem(value: unknown): HeaderNavItem | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const fallback = createHeaderNavItem()
  return {
    id: asString(row.id, newId()),
    name: asString(row.name),
    enabled: asBool(row.enabled, true),
    path: asString(row.path, '/'),
    label: asStringMap(row.label, fallback.label),
    description: asStringMap(row.description, fallback.description),
    accents: asAccentMap(row.accents, fallback.accents),
    accent: typeof row.accent === 'string' ? row.accent : null,
    imageUrl: asString(row.imageUrl),
    labelStyle: parseTextStyle(row.labelStyle, fallback.labelStyle),
    descriptionStyle: parseTextStyle(
      row.descriptionStyle,
      fallback.descriptionStyle,
    ),
  }
}

function parseSocial(value: unknown): HeaderSocial | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const fallback = createHeaderSocial()
  const label = asString(row.label) || asString(row.name)
  const href = asString(row.href)
  const hintPath = asString(row.iconUrl)
  const iconId = resolveSiteIconId(row.iconId, hintPath, label, href, 'external')
  return {
    id: asString(row.id, newId()),
    name: asString(row.name),
    enabled: asBool(row.enabled, true),
    label,
    href,
    iconId,
    labelStyle: parseTextStyle(row.labelStyle, fallback.labelStyle),
  }
}

export function parseHeaderPayload(payload: unknown): CmsHeaderPayload {
  const fallback = defaultHeaderPayload()
  if (!payload || typeof payload !== 'object') return fallback
  const row = payload as Record<string, unknown>
  const navItems = Array.isArray(row.navItems)
    ? row.navItems
        .map(parseNavItem)
        .filter((item): item is HeaderNavItem => item !== null)
    : fallback.navItems
  const socials = Array.isArray(row.socials)
    ? row.socials
        .map(parseSocial)
        .filter((item): item is HeaderSocial => item !== null)
    : fallback.socials

  const ctaLabelMap = asStringMap(row.ctaLabel, fallback.ctaLabel)
  const ctaHint = asString(row.ctaIconUrl) || ASSETS.hireMe
  const ctaIconId = resolveSiteIconId(
    row.ctaIconId,
    ctaHint,
    `${ctaLabelMap.pt} ${ctaLabelMap.en} hire contact`,
    asString(row.ctaTo),
    fallback.ctaIconId,
  )

  return {
    version: 3,
    sectionName: asString(row.sectionName),
    chromeStyle: parseChromeStyle(row.chromeStyle),
    modulesOrder: parseHeaderModulesOrder(row.modulesOrder),
    logoUrl: asString(row.logoUrl, fallback.logoUrl),
    logoHeight: asNumber(row.logoHeight, 0),
    logoEnabled: asBool(row.logoEnabled, true),
    menuEnabled: asBool(row.menuEnabled, true),
    menuOpen: asStringMap(row.menuOpen, fallback.menuOpen),
    menuClose: asStringMap(row.menuClose, fallback.menuClose),
    menuOpenStyle: parseTextStyle(row.menuOpenStyle, fallback.menuOpenStyle),
    menuCloseStyle: parseTextStyle(row.menuCloseStyle, fallback.menuCloseStyle),
    ctaEnabled: asBool(row.ctaEnabled, true),
    ctaLabel: ctaLabelMap,
    ctaLabelStyle: parseTextStyle(row.ctaLabelStyle, fallback.ctaLabelStyle),
    ctaButtonStyle: parseButtonStyle(
      row.ctaButtonStyle,
      fallback.ctaButtonStyle,
    ),
    ctaIconId,
    ctaTo: asString(row.ctaTo, fallback.ctaTo),
    navGroupStyle: parseGroupStyle(row.navGroupStyle),
    socialGroupStyle: parseGroupStyle(row.socialGroupStyle),
    navItems: navItems.length > 0 ? navItems : fallback.navItems,
    socials: socials.length > 0 ? socials : fallback.socials,
  }
}

export async function fetchHeaderPayload(): Promise<CmsHeaderPayload> {
  const fallback = defaultHeaderPayload()
  if (!supabase) return fallback

  const { data, error } = await supabase
    .from('cms_content')
    .select('payload')
    .eq('key', CMS_HEADER_KEY)
    .maybeSingle()

  if (error || !data) return fallback
  return parseHeaderPayload(data.payload)
}

export async function saveHeaderPayload(payload: CmsHeaderPayload) {
  if (!supabase) {
    throw new Error('Supabase não configurado')
  }

  const { error } = await supabase.from('cms_content').upsert({
    key: CMS_HEADER_KEY,
    payload,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error
}
