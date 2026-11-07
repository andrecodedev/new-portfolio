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
]

const IDS = new Set(SITE_ICON_OPTIONS.map((item) => item.id))

export function isSiteIconId(value: unknown): value is SiteIconId {
  return typeof value === 'string' && IDS.has(value as SiteIconId)
}

export function SiteIcon({
  id,
  className,
  style,
}: {
  id: string
  className?: string
  style?: CSSProperties
}): ReactNode {
  const common = {
    className: ['site-icon', className].filter(Boolean).join(' '),
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    'aria-hidden': true as const,
    style,
  }

  switch (id) {
    case 'arrow-up':
      return (
        <svg {...common}>
          <path
            d="M12 19V5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M6.5 10.5 12 5l5.5 5.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'news':
      return (
        <svg {...common}>
          <rect
            x="3.5"
            y="3.5"
            width="17"
            height="17"
            rx="3.2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M10.2 13.8 15.6 8.4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M11.8 8.4h3.8v3.8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'settings':
      return (
        <svg {...common}>
          <path
            d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M19.4 13a7.8 7.8 0 0 0 .05-2l2.02-1.57-2-3.46-2.42.98a7.9 7.9 0 0 0-1.73-1L15 2.5h-6l-.32 2.45a7.9 7.9 0 0 0-1.73 1l-2.42-.98-2 3.46L4.55 11a7.8 7.8 0 0 0 0 2l-2.02 1.57 2 3.46 2.42-.98c.54.42 1.12.76 1.73 1L9 21.5h6l.32-2.45c.61-.24 1.19-.58 1.73-1l2.42.98 2-3.46L19.4 13Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'chat':
      return (
        <svg {...common}>
          <path
            d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15H10l-3.5 3.2V15H7.5A2.5 2.5 0 0 1 5 12.5v-6Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 9h7M8.5 12h4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'home':
      return (
        <svg {...common}>
          <path
            d="M4.5 11.5 12 5l7.5 6.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 10.5V19h10v-8.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'external':
      return (
        <svg {...common}>
          <path
            d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5V14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M13 5h6v6M19 5l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'mail':
      return (
        <svg {...common}>
          <rect
            x="3.5"
            y="5.5"
            width="17"
            height="13"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="m5 8 7 5 7-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'github':
      return (
        <svg {...common} fill="currentColor">
          <path d="M12 2.5c-5.2 0-9.4 4.2-9.4 9.4 0 4.2 2.7 7.7 6.4 8.9.5.1.6-.2.6-.4v-1.5c-2.6.6-3.2-1.1-3.2-1.1-.4-1-.9-1.3-.9-1.3-.8-.5.1-.5.1-.5.8.1 1.3.9 1.3.9.7 1.3 2 1 2.4.7.1-.5.3-.9.5-1.1-2.1-.2-4.3-1-4.3-4.6 0-1 .4-1.9 1-2.5-.1-.2-.4-1.2.1-2.5 0 0 .8-.3 2.6 1a9 9 0 0 1 4.7 0c1.8-1.3 2.6-1 2.6-1 .5 1.3.2 2.3.1 2.5.6.7 1 1.5 1 2.5 0 3.5-2.2 4.3-4.3 4.6.3.3.6.8.6 1.6v2.4c0 .2.2.5.7.4 3.7-1.2 6.3-4.7 6.3-8.9C21.4 6.7 17.2 2.5 12 2.5Z" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg {...common}>
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M8 11v5M8 8.5v.2M12 16v-3.2a1.8 1.8 0 0 1 3.6 0V16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'instagram':
      return (
        <svg {...common}>
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="4"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="16.4" cy="7.6" r="0.9" fill="currentColor" />
        </svg>
      )
    case 'youtube':
      return (
        <svg {...common}>
          <rect
            x="3"
            y="6.5"
            width="18"
            height="11"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="m11 9.5 4 2.5-4 2.5v-5Z" fill="currentColor" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
  }
}
