import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
import { ADMIN_BASE_PATH } from '../admin/admin-paths'
import { useLocale } from '../i18n/LocaleProvider'
import {
  defaultGatePayload,
  fetchGatePayload,
  type CmsGatePayload,
} from './gate-content'
import {
  defaultHeroPayload,
  fetchHeroPayload,
  firstIntro,
  heroSubtitleLines,
  heroTitleLines,
  type CmsHeroPayload,
} from './hero-content'

type CmsContextValue = {
  hero: CmsHeroPayload
  gate: CmsGatePayload
  ready: boolean
}

const CmsContext = createContext<CmsContextValue | null>(null)

export function CmsProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [hero, setHero] = useState<CmsHeroPayload>(() => defaultHeroPayload())
  const [gate, setGate] = useState<CmsGatePayload>(() => defaultGatePayload())
  const [ready, setReady] = useState(false)
  const onPublicSite = !location.pathname.startsWith(ADMIN_BASE_PATH)

  useEffect(() => {
    if (!onPublicSite) return

    let cancelled = false

    const load = async () => {
      const [heroPayload, gatePayload] = await Promise.all([
        fetchHeroPayload(),
        fetchGatePayload(),
      ])
      if (cancelled) return
      setHero(heroPayload)
      setGate(gatePayload)
      setReady(true)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [onPublicSite, location.pathname])

  const value = useMemo(
    () => ({
      hero,
      gate,
      ready,
    }),
    [hero, gate, ready],
  )

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>
}

export function useCmsHero() {
  const cms = useContext(CmsContext)
  return cms?.hero ?? defaultHeroPayload()
}

export function useCmsGate() {
  const cms = useContext(CmsContext)
  return cms?.gate ?? defaultGatePayload()
}

export function useHeroCopy() {
  const { locale, t } = useLocale()
  const hero = useCmsHero()
  const intro = firstIntro(hero)?.copy[locale]

  if (!intro) {
    return {
      titleLines: t.home.heroTitleLines,
      subtitleLines: t.home.heroSubtitleLines,
    }
  }

  return {
    titleLines: heroTitleLines(intro),
    subtitleLines: heroSubtitleLines(intro),
  }
}
