import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CodeRain from './components/CodeRain'
import {
  ASSETS,
  PAGE_META,
  SOCIAL_LINKS,
  getLoaderBgForPath,
  highlightAccents,
  type ContentPageId,
} from './data/site'
import {
  LOCALE_FLAGS,
  LOCALE_LABELS,
  LOCALES,
} from './i18n/copy'
import { LocaleProvider, useLocale } from './i18n/LocaleProvider'
import {
  MenuOpenProvider,
  RevealProvider,
  easeOutExpo,
  easeOutSoft,
  fabEntrance,
  headerFromRight,
  headerFromTop,
  headerStagger,
  menuDesc,
  menuFooter,
  menuFooterLine,
  menuItem,
  menuLabel,
  menuRoot,
  menuSocial,
  useEntrance,
  useMenuOpen,
} from './motion/reveal'
import {
  MaskTitle,
  RevealButton,
  RevealCopy,
  RevealRule,
  ScrollRootContext,
  sectionStagger,
  useScrollReveal,
  useScrollViewport,
  visibleRiseVariants,
  visibleSideVariants,
} from './motion/scroll-reveal'
import { usePageNavigator } from './navigation/usePageNavigator'
import {
  lockPageScroll,
  unlockPageScroll,
} from './navigation/scroll-lock'
import {
  getScrollRoot,
  getScrollRootClientHeight,
  getScrollRootTop,
  setScrollRoot,
  scrollRootToTop,
} from './navigation/scroll-root'
import './App.css'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'portfolio-theme'
const BOOT_LOADER_MIN_MS = 1400
const BOOT_LOADER_EXIT_MS = 700
/** Mesmo tempo do CSS `.menu` (subida/descida). */
const MENU_EXIT_MS = 700
/** Libera fades no começo da saída do loader (acompanha o painel, sem espera no final). */
const REVEAL_LEAD_MS = 90

function scaleXFromTransform(transform: string) {
  if (!transform || transform === 'none') return 0
  try {
    return new DOMMatrixReadOnly(transform).a
  } catch {
    return 0
  }
}

function isMenuText(node: EventTarget | null) {
  return (
    node instanceof Element &&
    (node.classList.contains('menu__link-label') ||
      node.classList.contains('menu__link-desc'))
  )
}

function commitWaveStyles(list: HTMLElement) {
  list.querySelectorAll<HTMLElement>('.menu__link-label').forEach((el) => {
    const cs = getComputedStyle(el)
    el.style.color = cs.color
    el.style.opacity = cs.opacity
    const after = getComputedStyle(el, '::after')
    el.style.setProperty(
      '--line-scale',
      String(scaleXFromTransform(after.transform)),
    )
  })
  list.querySelectorAll<HTMLElement>('.menu__link-desc').forEach((el) => {
    const cs = getComputedStyle(el)
    el.style.color = cs.color
    el.style.opacity = cs.opacity
  })
}

function releaseWaveStyles(list: HTMLElement) {
  list.querySelectorAll<HTMLElement>('.menu__link-label').forEach((el) => {
    const hovered = Boolean(
      el.closest('.menu__link')?.classList.contains('menu__link--hot'),
    )
    el.style.removeProperty('color')
    el.style.removeProperty('opacity')
    el.style.setProperty('--line-scale', hovered ? '1' : '0')
  })
  list.querySelectorAll<HTMLElement>('.menu__link-desc').forEach((el) => {
    el.style.removeProperty('color')
    el.style.removeProperty('opacity')
  })
}

function clearWaveStyles(list: HTMLElement | null) {
  if (!list) return
  list
    .querySelectorAll<HTMLElement>('.menu__link-label, .menu__link-desc')
    .forEach((el) => {
      el.style.removeProperty('color')
      el.style.removeProperty('opacity')
      el.style.removeProperty('--line-scale')
    })
}

function readStoredTheme(): Theme {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'light' ? 'light' : 'dark'
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  window.localStorage.setItem(THEME_STORAGE_KEY, theme)
}

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === 'dark') {
    return (
      <svg
        className="header__theme-icon"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 2v2.5M12 19.5V22M4.22 4.22l1.77 1.77M17.99 17.99l1.77 1.77M2 12h2.5M19.5 12H22M4.22 19.78l1.77-1.77M17.99 6.03l1.77-1.77"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return (
    <svg
      className="header__theme-icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20.2 13.4A8.2 8.2 0 0 1 10.6 3.8 8.5 8.5 0 1 0 20.2 13.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type IconProps = {
  src: string
  alt?: string
  className?: string
}

function Icon({ src, alt = '', className = 'header__icon' }: IconProps) {
  return <img className={className} src={src} alt={alt} draggable={false} />
}

function AccentedText({
  body,
  accents,
}: {
  body: string
  accents: readonly string[]
}) {
  return (
    <>
      {highlightAccents(body, accents).map((part) =>
        part.accent ? (
          <strong key={part.key} className="accent-text">
            {part.text}
          </strong>
        ) : (
          <span key={part.key}>{part.text}</span>
        ),
      )}
    </>
  )
}

type HeaderProps = {
  menuOpen: boolean
  menuId: string
  onToggleMenu: () => void
  onGoHome: () => void
  onHireMe: () => void
}

function Header({
  menuOpen,
  menuId,
  onToggleMenu,
  onGoHome,
  onHireMe,
}: HeaderProps) {
  const { show } = useEntrance()
  const { t } = useLocale()

  return (
    <motion.header
      className="header"
      initial="hidden"
      animate={show ? 'show' : 'hidden'}
      variants={headerStagger}
    >
      <motion.div className="header__cluster" variants={headerFromTop}>
        <a
          className="header__home"
          href="/"
          aria-label="Home"
          onClick={(event) => {
            event.preventDefault()
            onGoHome()
          }}
        >
          <Icon src={ASSETS.logo} alt="" />
        </a>
        <span className="header__sep" aria-hidden="true" />
        <button
          type="button"
          className="header__menu"
          aria-label={menuOpen ? t.chrome.closeMenu : t.chrome.openMenu}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={onToggleMenu}
        >
          <span className="header__menu-label">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={menuOpen ? 'close' : 'menu'}
                className="header__menu-text"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: easeOutExpo }}
              >
                {menuOpen ? t.chrome.close : t.chrome.menu}
              </motion.span>
            </AnimatePresence>
          </span>
        </button>
      </motion.div>

      <motion.a
        className="header__btn"
        href={PAGE_META.contact.path}
        aria-label={t.chrome.hireMe}
        variants={headerFromRight}
        onClick={(event) => {
          event.preventDefault()
          onHireMe()
        }}
      >
        <Icon src={ASSETS.hireMe} alt="" />
        <span>{t.chrome.hireMe}</span>
      </motion.a>
    </motion.header>
  )
}

function BackToTop() {
  const [visible, setVisible] = useState(false)
  const { show } = useEntrance()
  const { t } = useLocale()
  const reduce = Boolean(useReducedMotion())

  useEffect(() => {
    const sync = () => {
      const threshold = Math.min(420, getScrollRootClientHeight() * 0.55)
      setVisible(getScrollRootTop() > threshold)
    }

    const bind = () => {
      const root =
        getScrollRoot() ?? document.querySelector('.stage__scroll')
      if (!root) return () => {}
      root.addEventListener('scroll', sync, { passive: true })
      return () => root.removeEventListener('scroll', sync)
    }

    sync()
    let unbind = bind()
    window.addEventListener('resize', sync)
    const retry = window.setTimeout(() => {
      unbind()
      unbind = bind()
      sync()
    }, 0)

    return () => {
      window.clearTimeout(retry)
      unbind()
      window.removeEventListener('resize', sync)
    }
  }, [])

  return (
    <AnimatePresence>
      {show && visible ? (
        <motion.button
          type="button"
          className="back-top"
          aria-label={t.chrome.backToTop}
          title={t.chrome.backToTop}
          initial={reduce ? false : { opacity: 0, scale: 0.7, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, scale: 0.7, y: 12 }}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 24,
            mass: 0.75,
          }}
          onClick={() => {
            scrollRootToTop(reduce ? 'auto' : 'smooth')
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            aria-hidden="true"
          >
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
        </motion.button>
      ) : null}
    </AnimatePresence>
  )
}

type SideToolsProps = {
  theme: Theme
  onToggleTheme: () => void
}

function SideTools({ theme, onToggleTheme }: SideToolsProps) {
  const isDark = theme === 'dark'
  const rootRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const [touchMode, setTouchMode] = useState(false)
  const { show } = useEntrance()
  const { locale, setLocale, t } = useLocale()

  useEffect(() => {
    const media = window.matchMedia('(hover: none), (max-width: 1024px)')
    const sync = () => {
      setTouchMode(media.matches)
      if (!media.matches) setOpen(false)
    }
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!open || !touchMode) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!rootRef.current?.contains(target)) setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, touchMode])

  return (
    <motion.aside
      ref={rootRef}
      className={`side-tools${open ? ' side-tools--open' : ''}${touchMode ? ' side-tools--touch' : ''}`}
      aria-label={t.chrome.tools}
      initial="hidden"
      animate={show ? 'show' : 'hidden'}
      variants={fabEntrance}
      onMouseLeave={() => {
        if (!touchMode) setOpen(false)
      }}
    >
      <div className="side-tools__stack">
        <div
          className="side-tools__panel"
          id="side-tools-panel"
          inert={!open ? true : undefined}
        >
          <div className="side-tools__langs" role="group" aria-label={t.chrome.language}>
            {LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                className={`side-tools__lang${locale === code ? ' side-tools__lang--active' : ''}`}
                aria-label={LOCALE_LABELS[code]}
                aria-pressed={locale === code}
                title={LOCALE_LABELS[code]}
                onClick={() => setLocale(code)}
              >
                <span className="side-tools__flag" aria-hidden="true">
                  {LOCALE_FLAGS[code]}
                </span>
              </button>
            ))}
          </div>

          <span className="side-tools__divider" aria-hidden="true" />

          <div className="side-tools__theme">
            <span className="side-tools__theme-label" aria-hidden="true">
              <ThemeIcon theme={isDark ? 'light' : 'dark'} />
            </span>
            <button
              type="button"
              className={`side-tools__switch${isDark ? ' side-tools__switch--dark' : ''}`}
              role="switch"
              aria-checked={isDark}
              aria-label={isDark ? t.chrome.themeLight : t.chrome.themeDark}
              onClick={onToggleTheme}
            >
              <span className="side-tools__switch-thumb" />
            </button>
          </div>
        </div>

        <button
          type="button"
          className="side-tools__fab"
          aria-label={t.chrome.openSettings}
          aria-expanded={open}
          aria-controls="side-tools-panel"
          onMouseEnter={() => {
            if (!touchMode) setOpen(true)
          }}
          onClick={() => {
            if (touchMode) setOpen((current) => !current)
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            aria-hidden="true"
          >
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
        </button>
      </div>
    </motion.aside>
  )
}

function Copyright() {
  const { show, reduce } = useEntrance()
  const menuOpen = useMenuOpen()
  const { t } = useLocale()
  const visible = show && !menuOpen

  return (
    <motion.aside
      className="copyright"
      aria-label="Copyright"
      initial={reduce ? false : { opacity: 0, y: 28 }}
      animate={
        visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }
      }
      transition={
        visible
          ? { duration: 0.78, delay: 0.12, ease: easeOutSoft }
          : { duration: 0.55, ease: easeOutSoft }
      }
    >
      <div className="copyright__group">
        <span className="copyright__line" aria-hidden="true" />
        <p className="copyright__text">
          <span>{t.chrome.copyrightLine1}</span>
          <span>{t.chrome.copyrightLine2}</span>
        </p>
      </div>
    </motion.aside>
  )
}

type MenuProps = {
  id: string
  open: boolean
  onNavigate: (path: string) => void
}

type LoaderProps = {
  exiting: boolean
  background?: string
  onExitComplete: () => void
}

function Loader({
  exiting,
  background = 'var(--bg-loader)',
  onExitComplete,
}: LoaderProps) {
  const { t } = useLocale()

  return (
    <div
      className={`loader${exiting ? ' loader--exit' : ''}`}
      style={{ background }}
      role="status"
      aria-live="polite"
      aria-busy={!exiting}
      aria-label={t.chrome.loading}
      onTransitionEnd={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.propertyName !== 'transform') return
        if (!exiting) return
        onExitComplete()
      }}
    >
      <div className="loader__dots" aria-hidden="true">
        <span className="loader__dot" />
        <span className="loader__dot" />
        <span className="loader__dot" />
      </div>
    </div>
  )
}

function Menu({ id, open, onNavigate }: MenuProps) {
  const reduce = Boolean(useReducedMotion())
  const state = open ? 'show' : 'hidden'
  const { t } = useLocale()
  const [paused, setPaused] = useState(false)
  const [hotPath, setHotPath] = useState<string | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const pausedRef = useRef(false)
  pausedRef.current = paused

  useEffect(() => {
    if (!open) {
      setPaused(false)
      setHotPath(null)
      clearWaveStyles(listRef.current)
    }
  }, [open])

  useLayoutEffect(() => {
    const list = listRef.current
    if (!paused) {
      clearWaveStyles(list)
      return
    }
    if (!list) return

    const frame = window.requestAnimationFrame(() => {
      releaseWaveStyles(list)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [paused])

  const pauseWave = (path: string) => {
    if (!pausedRef.current && listRef.current) {
      commitWaveStyles(listRef.current)
    }
    setHotPath(path)
    setPaused(true)
  }

  const resumeWave = (event: { relatedTarget: EventTarget | null }) => {
    if (isMenuText(event.relatedTarget)) return
    setHotPath(null)
    setPaused(false)
  }

  const navLinks = [
    {
      label: t.navHome.label,
      path: '/',
      description: t.navHome.description,
      accent: null as ContentPageId | null,
    },
    {
      label: t.pages.work.menuLabel,
      path: PAGE_META.work.path,
      description: t.pages.work.menuDescription,
      accent: 'work' as const,
    },
    {
      label: t.pages.about.menuLabel,
      path: PAGE_META.about.path,
      description: t.pages.about.menuDescription,
      accent: 'about' as const,
    },
    {
      label: t.pages.reading.menuLabel,
      path: PAGE_META.reading.path,
      description: t.pages.reading.menuDescription,
      accent: 'reading' as const,
    },
    {
      label: t.pages.hire.menuLabel,
      path: PAGE_META.hire.path,
      description: t.pages.hire.menuDescription,
      accent: 'hire' as const,
    },
    {
      label: t.pages.contact.menuLabel,
      path: PAGE_META.contact.path,
      description: t.pages.contact.menuDescription,
      accent: 'contact' as const,
    },
  ]

  return (
    <div
      id={id}
      className={`menu${open ? ' menu--open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!open}
      inert={!open ? true : undefined}
    >
      <motion.nav
        className="menu__nav"
        aria-label="Primary"
        initial="hidden"
        animate={reduce && open ? 'show' : state}
        variants={menuRoot}
      >
        <ul
          ref={listRef}
          className={`menu__list${open && !reduce && !paused ? ' menu__list--wave' : ''}${paused ? ' menu__list--paused' : ''}`}
        >
          {navLinks.map((item) => (
            <motion.li
              key={item.path}
              className="menu__item"
              variants={reduce ? undefined : menuItem}
            >
              <a
                className={`menu__link${hotPath === item.path ? ' menu__link--hot' : ''}`}
                href={item.path}
                data-accent={item.accent ?? undefined}
                onClick={(event) => {
                  event.preventDefault()
                  onNavigate(item.path)
                }}
              >
                <motion.span
                  className="menu__link-label"
                  variants={reduce ? undefined : menuLabel}
                  onPointerEnter={() => pauseWave(item.path)}
                  onPointerLeave={resumeWave}
                >
                  {item.label}
                </motion.span>
                <motion.span
                  className="menu__link-desc"
                  variants={reduce ? undefined : menuDesc}
                  onPointerEnter={() => pauseWave(item.path)}
                  onPointerLeave={resumeWave}
                >
                  {item.description}
                </motion.span>
              </a>
            </motion.li>
          ))}
        </ul>
      </motion.nav>

      <motion.div
        className="menu__footer"
        initial="hidden"
        animate={reduce && open ? 'show' : state}
        variants={menuFooter}
      >
        {SOCIAL_LINKS.map((item) => (
          <motion.a
            key={item.label}
            className="menu__social"
            href={item.href}
            aria-label={item.label}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
            variants={reduce ? undefined : menuSocial}
          >
            <span className="menu__social-tip" aria-hidden="true">
              {item.label}
            </span>
            <Icon src={item.src} alt="" className="menu__social-icon" />
          </motion.a>
        ))}
        <motion.span
          className="menu__footer-line"
          aria-hidden="true"
          variants={reduce ? undefined : menuFooterLine}
          style={{ transformOrigin: 'left center' }}
        />
      </motion.div>
    </div>
  )
}

function Hero() {
  const { canAnimate, reduce, playId } = useScrollReveal()
  const scrollViewport = useScrollViewport()
  const { t } = useLocale()
  const titleLines = [...t.home.heroTitleLines]
  const rise = visibleRiseVariants(reduce)

  return (
    <section className="hero" id="introduction" aria-label="Introduction">
      <motion.div
        key={playId}
        className="hero__content"
        initial="hidden"
        whileInView={canAnimate ? 'show' : 'hidden'}
        viewport={scrollViewport}
        variants={sectionStagger}
      >
        <motion.div className="hero__copy" variants={rise}>
          <h1 className="hero__title">
            {titleLines.map((line) => (
              <span key={line} className="hero__title-line">
                <span className="hero__title-text">{line}</span>
              </span>
            ))}
          </h1>
          <p className="hero__subtitle">
            {t.home.heroSubtitleLines.map((line) => (
              <span key={line} className="hero__subtitle-line">
                {line}
              </span>
            ))}
          </p>
        </motion.div>

        <motion.div className="hero__media" variants={rise}>
          <div className="hero__avatar">
            <img
              className="hero__avatar-img"
              src={ASSETS.avatar}
              alt="André Vitor"
              draggable={false}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

function ScrollCue() {
  const letters = ['S', 'C', 'R', 'O', 'L', 'L']
  const { canAnimate, reduce, playId } = useScrollReveal()
  const scrollViewport = useScrollViewport()
  const rise = visibleRiseVariants(reduce)

  return (
    <motion.section
      key={playId}
      className="scroll"
      aria-hidden="true"
      initial="hidden"
      whileInView={canAnimate ? 'show' : 'hidden'}
      viewport={scrollViewport}
      variants={rise}
    >
      <div className="scroll__inner">
        <span className="scroll__label">
          {letters.map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="scroll__char"
              style={{ animationDelay: `${index * 0.16}s` }}
            >
              {letter}
            </span>
          ))}
        </span>
        <span className="scroll__line" />
      </div>
    </motion.section>
  )
}

type NavigateProps = {
  onNavigate: (path: string) => void
}

function Works({ onNavigate }: NavigateProps) {
  const { canAnimate, reduce, playId } = useScrollReveal()
  const scrollViewport = useScrollViewport()
  const { t } = useLocale()
  const copy = t.home.works

  return (
    <section
      className="works"
      id="trabalhos"
      aria-label={copy.ariaLabel}
      data-accent="work"
    >
      <motion.div
        key={playId}
        className="works__inner"
        initial="hidden"
        whileInView={canAnimate ? 'show' : 'hidden'}
        viewport={scrollViewport}
        variants={sectionStagger}
      >
        <motion.div className="works__heading" variants={sectionStagger}>
          <MaskTitle
            className="works__title"
            lines={[...copy.titleLines]}
            reduce={reduce}
            side="left"
          />
          <RevealRule className="works__rule" from="left" side="left" />
        </motion.div>

        <RevealCopy className="works__text" side="left">
          <AccentedText body={copy.body} accents={copy.accents} />
        </RevealCopy>

        <RevealButton
          className="works__btn"
          side="left"
          onClick={() => onNavigate(PAGE_META.work.path)}
        >
          {copy.cta}
        </RevealButton>
      </motion.div>
    </section>
  )
}

type SpotAlign = 'start' | 'end'
type AccentTone = 'work' | 'about' | 'reading' | 'hire' | 'contact'

type SpotProps = {
  id: string
  ariaLabel: string
  align?: SpotAlign
  accent: AccentTone
  titleLine1: string
  titleLine2: string
  text: ReactNode
  ctaLabel: string
  to: string
  onNavigate: (path: string) => void
}

function Spot({
  id,
  ariaLabel,
  align = 'start',
  accent,
  titleLine1,
  titleLine2,
  text,
  ctaLabel,
  to,
  onNavigate,
}: SpotProps) {
  const { canAnimate, reduce, playId } = useScrollReveal()
  const scrollViewport = useScrollViewport()
  const side = align === 'end' ? 'right' : 'left'

  return (
    <section
      className={`spot${align === 'end' ? ' spot--end' : ''}`}
      id={id}
      aria-label={ariaLabel}
      data-accent={accent}
    >
      <motion.div
        key={playId}
        className="spot__inner"
        initial="hidden"
        whileInView={canAnimate ? 'show' : 'hidden'}
        viewport={scrollViewport}
        variants={sectionStagger}
      >
        <motion.div className="spot__heading" variants={sectionStagger}>
          <MaskTitle
            className="spot__title"
            lines={[titleLine1, titleLine2]}
            reduce={reduce}
            side={side}
          />
          <RevealRule className="spot__rule" from={side} side={side} />
        </motion.div>

        <RevealCopy className="spot__text" side={side}>
          {text}
        </RevealCopy>

        <RevealButton
          className="spot__btn"
          side={side}
          onClick={() => onNavigate(to)}
        >
          {ctaLabel}
        </RevealButton>
      </motion.div>
    </section>
  )
}

function ContentPage({ pageId }: { pageId: ContentPageId }) {
  const { t } = useLocale()
  const page = t.pages[pageId]
  const meta = PAGE_META[pageId]
  const accent = meta.accent
  const titleBase = page.title.replace(/\.$/, '')
  const { canAnimate, reduce, playId } = useScrollReveal()
  const scrollViewport = useScrollViewport()
  const rise = visibleRiseVariants(reduce)

  return (
    <>
      <section className="hero hero--page" aria-label={page.title} data-accent={accent}>
        <motion.div
          key={playId}
          className="hero__content"
          initial="hidden"
          whileInView={canAnimate ? 'show' : 'hidden'}
          viewport={scrollViewport}
          variants={sectionStagger}
        >
          <motion.div className="hero__copy" variants={rise}>
            <div className="hero__heading">
              <h1 className="hero__title">
                <span className="hero__title-line">
                  <span className="hero__title-text">
                    {titleBase}
                    <span className="accent-mark">.</span>
                  </span>
                </span>
              </h1>
              <span className="hero__rule" aria-hidden="true" />
            </div>
            <p className="hero__subtitle hero__subtitle--page">
              <AccentedText body={page.body} accents={page.accents} />
            </p>
          </motion.div>
          <motion.div className="hero__media" variants={rise}>
            <div className="hero__figure">
              <img
                className="hero__figure-img"
                src={meta.image}
                alt={page.imageAlt}
                draggable={false}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>
      <ScrollCue />
      <Copyright />
    </>
  )
}

function HomePage({ onNavigate }: NavigateProps) {
  const { t } = useLocale()

  return (
    <>
      <Hero />
      <ScrollCue />
      <Works onNavigate={onNavigate} />
      <Spot
        id="historia"
        ariaLabel={t.home.about.ariaLabel}
        align="end"
        accent="about"
        titleLine1={t.home.about.titleLines[0]}
        titleLine2={t.home.about.titleLines[1]}
        text={
          <AccentedText
            body={t.home.about.body}
            accents={t.home.about.accents}
          />
        }
        ctaLabel={t.home.about.cta}
        to={PAGE_META.about.path}
        onNavigate={onNavigate}
      />
      <Spot
        id="estudos"
        ariaLabel={t.home.reading.ariaLabel}
        align="start"
        accent="reading"
        titleLine1={t.home.reading.titleLines[0]}
        titleLine2={t.home.reading.titleLines[1]}
        text={
          <AccentedText
            body={t.home.reading.body}
            accents={t.home.reading.accents}
          />
        }
        ctaLabel={t.home.reading.cta}
        to={PAGE_META.reading.path}
        onNavigate={onNavigate}
      />
      <Spot
        id="contrato"
        ariaLabel={t.home.hire.ariaLabel}
        align="end"
        accent="hire"
        titleLine1={t.home.hire.titleLines[0]}
        titleLine2={t.home.hire.titleLines[1]}
        text={
          <AccentedText
            body={t.home.hire.body}
            accents={t.home.hire.accents}
          />
        }
        ctaLabel={t.home.hire.cta}
        to={PAGE_META.hire.path}
        onNavigate={onNavigate}
      />
      <Spot
        id="juntos"
        ariaLabel={t.home.contact.ariaLabel}
        align="start"
        accent="contact"
        titleLine1={t.home.contact.titleLines[0]}
        titleLine2={t.home.contact.titleLines[1]}
        text={
          <AccentedText
            body={t.home.contact.body}
            accents={t.home.contact.accents}
          />
        }
        ctaLabel={t.home.contact.cta}
        to={PAGE_META.contact.path}
        onNavigate={onNavigate}
      />
      <Copyright />
    </>
  )
}

function PortfolioShell() {
  const menuId = useId()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  /** Mantém copyright/FAB escondidos até o menu terminar de subir. */
  const [menuBlocksChrome, setMenuBlocksChrome] = useState(false)
  /** Liberação das fades (não começa atrás do loader parado). */
  const [revealReady, setRevealReady] = useState(false)
  const [bootVisible, setBootVisible] = useState(true)
  const [bootExiting, setBootExiting] = useState(false)
  const [bootBackground] = useState(() =>
    typeof window === 'undefined'
      ? 'var(--bg-loader)'
      : getLoaderBgForPath(window.location.pathname),
  )
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === 'undefined') return 'dark'
    const current = document.documentElement.getAttribute('data-theme')
    if (current === 'light' || current === 'dark') return current
    return readStoredTheme()
  })
  const { transition, goTo, finishTransition, transitionExitMs } =
    usePageNavigator()

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    const el = scrollRef.current
    setScrollRoot(el)
    if (el && document.documentElement.classList.contains('is-scroll-locked')) {
      el.classList.add('is-scroll-locked')
    }
    return () => setScrollRoot(null)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      setMenuBlocksChrome(true)
      return
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reducedMotion) {
      setMenuBlocksChrome(false)
      return
    }

    const timer = window.setTimeout(() => {
      setMenuBlocksChrome(false)
    }, MENU_EXIT_MS)

    return () => window.clearTimeout(timer)
  }, [menuOpen])

  useEffect(() => {
    const loaderCovering =
      (bootVisible && !bootExiting) ||
      (transition.active && !transition.exiting)

    if (loaderCovering) {
      setRevealReady(false)
      return
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    // Loader já fora: libera na hora. Em saída: espera só um pouquinho e acompanha o slide.
    const fullyClear = !bootVisible && !transition.active
    const delay = reducedMotion || fullyClear ? 0 : REVEAL_LEAD_MS
    const timer = window.setTimeout(() => {
      setRevealReady(true)
    }, delay)

    return () => window.clearTimeout(timer)
  }, [bootVisible, bootExiting, transition.active, transition.exiting])

  useEffect(() => {
    if (!bootVisible) return

    let cancelled = false
    const startedAt = Date.now()
    lockPageScroll()

    const waitForReady = async () => {
      try {
        await document.fonts.ready
      } catch {
        // fontes falharam: segue mesmo assim
      }

      if (document.readyState !== 'complete') {
        await new Promise<void>((resolve) => {
          window.addEventListener('load', () => resolve(), { once: true })
        })
      }

      const remaining = Math.max(0, BOOT_LOADER_MIN_MS - (Date.now() - startedAt))
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, remaining)
      })

      if (cancelled) return
      setBootExiting(true)
    }

    void waitForReady()

    return () => {
      cancelled = true
      unlockPageScroll()
    }
  }, [bootVisible])

  useEffect(() => {
    if (!bootExiting) return

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (!reducedMotion) return

    const timer = window.setTimeout(() => {
      setBootVisible(false)
      unlockPageScroll()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [bootExiting])

  useEffect(() => {
    if (!bootExiting || !bootVisible) return

    const failsafe = window.setTimeout(() => {
      setBootVisible(false)
      unlockPageScroll()
    }, BOOT_LOADER_EXIT_MS + 80)

    return () => window.clearTimeout(failsafe)
  }, [bootExiting, bootVisible])

  useEffect(() => {
    if (!transition.exiting || !transition.active) return

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const delay = reducedMotion ? 0 : transitionExitMs + 80
    const timer = window.setTimeout(() => {
      finishTransition()
    }, delay)

    return () => window.clearTimeout(timer)
  }, [
    finishTransition,
    transition.active,
    transition.exiting,
    transitionExitMs,
  ])

  useEffect(() => {
    if (!menuOpen || bootVisible || transition.active) return

    lockPageScroll()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      unlockPageScroll()
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen, bootVisible, transition.active])

  const handleBootExitComplete = () => {
    setBootVisible(false)
    unlockPageScroll()
  }

  const navigateTo = (path: string) => {
    setMenuOpen(false)
    goTo(path)
  }

  return (
    <RevealProvider ready={revealReady}>
      <MenuOpenProvider open={menuBlocksChrome}>
        <div className={`page${menuBlocksChrome ? ' page--menu-open' : ''}`}>
          <div className="stage-panel stage-panel--loader">
            {bootVisible ? (
              <Loader
                exiting={bootExiting}
                background={bootBackground}
                onExitComplete={handleBootExitComplete}
              />
            ) : null}
            {transition.active ? (
              <Loader
                exiting={transition.exiting}
                background={transition.background}
                onExitComplete={finishTransition}
              />
            ) : null}
          </div>
          <Header
            menuOpen={menuOpen}
            menuId={menuId}
            onToggleMenu={() => setMenuOpen((open) => !open)}
            onGoHome={() => navigateTo('/')}
            onHireMe={() => navigateTo(PAGE_META.contact.path)}
          />
          <div className="corner-tools">
            <BackToTop />
            <SideTools
              theme={theme}
              onToggleTheme={() =>
                setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
              }
            />
          </div>
          <div className="stage-panel stage-panel--menu">
            <Menu id={menuId} open={menuOpen} onNavigate={navigateTo} />
          </div>
          <div className="stage" aria-hidden="true">
            <div className="stage__rain">
              <CodeRain />
            </div>
          </div>
          <ScrollRootContext.Provider value={scrollRef}>
            <div className="stage__scroll" ref={scrollRef}>
              <Routes>
                <Route
                  path="/"
                  element={<HomePage onNavigate={navigateTo} />}
                />
                <Route
                  path={PAGE_META.work.path}
                  element={<ContentPage pageId="work" />}
                />
                <Route
                  path={PAGE_META.about.path}
                  element={<ContentPage pageId="about" />}
                />
                <Route
                  path={PAGE_META.reading.path}
                  element={<ContentPage pageId="reading" />}
                />
                <Route
                  path={PAGE_META.hire.path}
                  element={<ContentPage pageId="hire" />}
                />
                <Route
                  path={PAGE_META.contact.path}
                  element={<ContentPage pageId="contact" />}
                />
              </Routes>
            </div>
          </ScrollRootContext.Provider>
        </div>
      </MenuOpenProvider>
    </RevealProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
        <PortfolioShell />
      </LocaleProvider>
    </BrowserRouter>
  )
}

export default App
