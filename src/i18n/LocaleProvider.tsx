import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  DICTIONARIES,
  isLocale,
  type Dictionary,
  type Locale,
} from './copy'

const STORAGE_KEY = 'portfolio-locale'

type LocaleContextValue = {
  locale: string
  setLocale: (locale: string) => void
  t: Dictionary
  dictionaryLocale: Locale
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function readStoredLocale(): string {
  if (typeof window === 'undefined') return 'pt'
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && stored.trim()) return stored.trim()
  } catch {
    // storage bloqueado: segue com pt
  }
  return 'pt'
}

function dictionaryFor(locale: string): Locale {
  return isLocale(locale) ? locale : 'pt'
}

function applyHtmlLang(locale: string) {
  if (typeof document === 'undefined') return
  const dictLocale = dictionaryFor(locale)
  document.documentElement.lang = DICTIONARIES[dictLocale].htmlLang
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<string>(() => readStoredLocale())

  useEffect(() => {
    applyHtmlLang(locale)
  }, [locale])

  const setLocale = useCallback((next: string) => {
    const code = next.trim() || 'pt'
    setLocaleState(code)
    applyHtmlLang(code)
    try {
      window.localStorage.setItem(STORAGE_KEY, code)
    } catch {
      // ignore
    }
  }, [])

  const dictionaryLocale = dictionaryFor(locale)

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: DICTIONARIES[dictionaryLocale],
      dictionaryLocale,
    }),
    [locale, setLocale, dictionaryLocale],
  )

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return ctx
}
