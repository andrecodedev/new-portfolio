import {
  ArrowSquareOut,
  ArrowUp,
  Briefcase,
  ChatCircleDots,
  Code,
  EnvelopeSimple,
  GithubLogo,
  House,
  InstagramLogo,
  LinkedinLogo,
  Newspaper,
  GearSix,
  Sparkle,
  Stack,
  YoutubeLogo,
  type Icon,
} from '@phosphor-icons/react'
import type { CSSProperties, ReactNode } from 'react'

export type SiteIconId =
  | 'arrow-up'
  | 'news'
  | 'settings'
  | 'chat'
  | 'home'
  | 'external'
  | 'mail'
  | 'github'
  | 'linkedin'
  | 'instagram'
  | 'youtube'
  | 'code'
  | 'briefcase'
  | 'spark'
  | 'layers'

export type SiteIconOption = {
  id: SiteIconId
  label: string
}

export const SITE_ICON_OPTIONS: SiteIconOption[] = [
  { id: 'arrow-up', label: 'Seta ao topo' },
  { id: 'news', label: 'Novidades' },
  { id: 'settings', label: 'Engrenagem' },
  { id: 'chat', label: 'Chat / contato' },
  { id: 'home', label: 'Home' },
  { id: 'external', label: 'Link externo' },
  { id: 'mail', label: 'Email' },
  { id: 'github', label: 'GitHub' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'code', label: 'Código' },
  { id: 'briefcase', label: 'Trabalho' },
  { id: 'spark', label: 'Ideia' },
  { id: 'layers', label: 'Camadas' },
]

const ICONS: Record<SiteIconId, Icon> = {
  'arrow-up': ArrowUp,
  news: Newspaper,
  settings: GearSix,
  chat: ChatCircleDots,
  home: House,
  external: ArrowSquareOut,
  mail: EnvelopeSimple,
  github: GithubLogo,
  linkedin: LinkedinLogo,
  instagram: InstagramLogo,
  youtube: YoutubeLogo,
  code: Code,
  briefcase: Briefcase,
  spark: Sparkle,
  layers: Stack,
}

const IDS = new Set(SITE_ICON_OPTIONS.map((item) => item.id))

export function isSiteIconId(value: unknown): value is SiteIconId {
  return typeof value === 'string' && IDS.has(value as SiteIconId)
}

export function SiteIcon({
  id,
  className,
  style,
  bare: _bare = false,
}: {
  id: string
  className?: string
  style?: CSSProperties
  /** Mantido por compat — ícones não usam mais tile. */
  bare?: boolean
}): ReactNode {
  const Icon = isSiteIconId(id) ? ICONS[id] : ArrowSquareOut
  return (
    <Icon
      className={['site-icon', className].filter(Boolean).join(' ')}
      weight="regular"
      aria-hidden
      style={style}
    />
  )
}
