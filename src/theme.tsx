import { Moon, Sun } from '@phosphor-icons/react'

export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'portfolio-theme'

export function readStoredTheme(): Theme {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'light' ? 'light' : 'dark'
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  window.localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export function readDocumentTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  const current = document.documentElement.getAttribute('data-theme')
  if (current === 'light' || current === 'dark') return current
  return readStoredTheme()
}

export function ThemeIcon({
  theme,
  className = 'header__theme-icon',
}: {
  theme: Theme
  className?: string
}) {
  if (theme === 'dark') {
    return <Sun className={className} weight="regular" aria-hidden />
  }
  return <Moon className={className} weight="regular" aria-hidden />
}
