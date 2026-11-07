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
  defaultChromePayload,
  fetchChromePayload,
  type CmsChromePayload,
} from './chrome-content'
import {
  applyDesignToDocument,
  defaultDesignPayload,
  designCssVars,
  fetchDesignPayload,
  type CmsDesignPayload,
} from './design-content'
import {
  defaultFooterPayload,
  fetchFooterPayload,
  type CmsFooterPayload,
} from './footer-content'
import {
  defaultGatePayload,
  fetchGatePayload,
  type CmsGatePayload,
} from './gate-content'
import {
  defaultHeaderPayload,
  fetchHeaderPayload,
  type CmsHeaderPayload,
} from './header-content'
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
  header: CmsHeaderPayload
  footer: CmsFooterPayload
  chrome: CmsChromePayload
  design: CmsDesignPayload
  ready: boolean
}

const CmsContext = createContext<CmsContextValue | null>(null)

export function CmsProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [hero, setHero] = useState<CmsHeroPayload>(() => defaultHeroPayload())
  const [gate, setGate] = useState<CmsGatePayload>(() => defaultGatePayload())
  const [header, setHeader] = useState<CmsHeaderPayload>(() =>
    defaultHeaderPayload(),
  )
  const [footer, setFooter] = useState<CmsFooterPayload>(() =>
    defaultFooterPayload(),
  )
  const [chrome, setChrome] = useState<CmsChromePayload>(() =>
    defaultChromePayload(),
  )
  const [design, setDesign] = useState<CmsDesignPayload>(() =>
    defaultDesignPayload(),
  )
  const [ready, setReady] = useState(false)
  const onPublicSite = !location.pathname.startsWith(ADMIN_BASE_PATH)

  useEffect(() => {
    if (!onPublicSite) return

    let cancelled = false

    const load = async () => {
      const [
        heroPayload,
        gatePayload,
        headerPayload,
        footerPayload,
        chromePayload,
        designPayload,
      ] = await Promise.all([
        fetchHeroPayload(),
        fetchGatePayload(),
        fetchHeaderPayload(),
        fetchFooterPayload(),
        fetchChromePayload(),
        fetchDesignPayload(),
      ])
      if (cancelled) return
      setHero(heroPayload)
      setGate(gatePayload)
      setHeader(headerPayload)
      setFooter(footerPayload)
      setChrome(chromePayload)
      setDesign(designPayload)
      setReady(true)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [onPublicSite, location.pathname])

  useEffect(() => {
    if (!onPublicSite) return

    const styleId = 'cms-design-vars'
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = styleId
      document.head.appendChild(styleEl)
    }

    const desktop = designCssVars(design, 'desktop')
    const mobile = designCssVars(design, 'mobile')
    const toCss = (vars: Record<string, string>) =>
      Object.entries(vars)
        .map(([key, value]) => `${key}:${value};`)
        .join('')

    styleEl.textContent = `:root{${toCss(desktop)}}@media (max-width:1023px){:root{--respiro:${mobile['--respiro']};}}`
    applyDesignToDocument(design, 'desktop')

    return () => {
      // keep injected vars while browsing public routes
    }
  }, [design, onPublicSite])

  const value = useMemo(
    () => ({
      hero,
      gate,
      header,
      footer,
      chrome,
      design,
      ready,
    }),
    [hero, gate, header, footer, chrome, design, ready],
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

export function useCmsHeader() {
  const cms = useContext(CmsContext)
  return cms?.header ?? defaultHeaderPayload()
}

export function useCmsFooter() {
  const cms = useContext(CmsContext)
  return cms?.footer ?? defaultFooterPayload()
}

export function useCmsChrome() {
  const cms = useContext(CmsContext)
  return cms?.chrome ?? defaultChromePayload()
}

export function useCmsDesign() {
  const cms = useContext(CmsContext)
  return cms?.design ?? defaultDesignPayload()
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
