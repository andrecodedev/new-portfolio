import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { GitHubCalendar } from 'react-github-calendar'
import { AccentedText } from './components/accented-text'
import { DepthCarousel } from './components/depth-carousel'
import { LayoutGrid } from './components/layout-grid'
import CodeRain from './components/CodeRain'
import { SkeletonImage } from './components/skeleton-image'
import { Moon, Sun } from '@phosphor-icons/react'
import { applyTheme, readDocumentTheme, type Theme } from './theme'
import {
  ASSETS,
  PAGE_META,
  getAccentForPath,
  getLoaderBgForPath,
  type ContentPageId,
} from './data/site'
import { SKILLS } from './data/about'
import {
  LOCALE_FLAGS,
  type AchievementEntry,
  type ExperienceEntry,
  type HighlightEntry,
  type Locale,
} from './i18n/copy'
import AdminAuth from './admin/admin-auth'
import AdminDashboard from './admin/admin-dashboard'
import { ADMIN_BASE_PATH, ADMIN_DASHBOARD_PATH } from './admin/admin-paths'
import {
  CmsProvider,
  useCmsChrome,
  useCmsFooter,
  useCmsHeader,
  useCmsHero,
} from './cms/cms-provider'
import { fabStyleCss } from './cms/chrome-content'
import { headerChromeCss } from './cms/header-content'
import { SiteIcon } from './cms/icon-registry'
import { buttonStyleCss, textStyleCss } from './cms/style-tokens'
import GatePopup from './cms/gate-popup'
import { HeroModulesView } from './cms/hero-stack'
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

function isMenuLinkTarget(node: EventTarget | null) {
  return node instanceof Element && Boolean(node.closest('.menu__link'))
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

type IconProps = {
  src: string
  alt?: string
  className?: string
  style?: CSSProperties
}

function Icon({ src, alt = '', className = 'header__icon', style }: IconProps) {
  return (
    <img className={className} src={src} alt={alt} style={style} draggable={false} />
  )
}

type HeaderProps = {
  menuOpen: boolean
  menuId: string
  pinned?: boolean
  onToggleMenu: () => void
  onGoHome: () => void
  onHireMe: (path: string) => void
}

function Header({
  menuOpen,
  menuId,
  pinned = false,
  onToggleMenu,
  onGoHome,
  onHireMe,
}: HeaderProps) {
  const { show } = useEntrance()
  const { locale, t } = useLocale()
  const header = useCmsHeader()
  const reduce = Boolean(useReducedMotion())
  const [away, setAway] = useState(false)
  const lastTop = useRef(0)
  const menuLabel = menuOpen
    ? header.menuClose[locale] || t.chrome.close
    : header.menuOpen[locale] || t.chrome.menu
  const ctaLabel = header.ctaLabel[locale] || t.chrome.hireMe

  useEffect(() => {
    if (pinned) {
      setAway(false)
      return
    }

    const TOP_ALWAYS = 24
    const DELTA = 8

    const sync = () => {
      const top = getScrollRootTop()
      const delta = top - lastTop.current

      if (top <= TOP_ALWAYS) {
        setAway(false)
      } else if (delta > DELTA) {
        setAway(true)
      } else if (delta < -DELTA) {
        setAway(false)
      }

      lastTop.current = top
    }

    const bind = () => {
      const root =
        getScrollRoot() ?? document.querySelector('.stage__scroll')
      if (!root) return () => {}
      lastTop.current = root.scrollTop
      sync()
      root.addEventListener('scroll', sync, { passive: true })
      return () => root.removeEventListener('scroll', sync)
    }

    let unbind = bind()
    const timer = window.setTimeout(() => {
      unbind()
      unbind = bind()
    }, 0)

    return () => {
      window.clearTimeout(timer)
      unbind()
    }
  }, [pinned])

  const hide = away && !pinned && !reduce

  const chromeCss = headerChromeCss(header.chromeStyle)

  return (
    <motion.header
      className={`header${hide ? ' header--away' : ''}`}
      style={chromeCss}
      initial="hidden"
      animate={show ? 'show' : 'hidden'}
      variants={headerStagger}
    >
      <motion.div className="header__cluster" variants={headerFromTop}>
        {header.modulesOrder.includes('logo') && header.logoEnabled ? (
          <a
            className="header__home"
            href="/"
            aria-label="Home"
            onClick={(event) => {
              event.preventDefault()
              onGoHome()
            }}
          >
            <Icon
              src={header.logoUrl || ASSETS.logo}
              alt=""
              className="header__icon"
              style={
                header.logoHeight > 0
                  ? { width: header.logoHeight, height: header.logoHeight }
                  : undefined
              }
            />
          </a>
        ) : null}
        {header.modulesOrder.includes('logo') &&
        header.logoEnabled &&
        header.modulesOrder.includes('menu') &&
        header.menuEnabled ? (
          <span className="header__sep" aria-hidden="true" />
        ) : null}
        {header.modulesOrder.includes('menu') && header.menuEnabled ? (
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
                  style={textStyleCss(
                    menuOpen ? header.menuCloseStyle : header.menuOpenStyle,
                  )}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: easeOutExpo }}
                >
                  {menuLabel}
                </motion.span>
              </AnimatePresence>
            </span>
          </button>
        ) : null}
      </motion.div>

      {header.modulesOrder.includes('cta') && header.ctaEnabled ? (
        <motion.a
          className="header__btn"
          href={header.ctaTo || PAGE_META.contact.path}
          aria-label={ctaLabel}
          style={buttonStyleCss(header.ctaButtonStyle)}
          variants={headerFromRight}
          onClick={(event) => {
            event.preventDefault()
            onHireMe(header.ctaTo || PAGE_META.contact.path)
          }}
        >
          <SiteIcon
            id={header.ctaIconId || 'external'}
            className="header__icon"
          />
          <span style={textStyleCss(header.ctaLabelStyle)}>{ctaLabel}</span>
        </motion.a>
      ) : null}
    </motion.header>
  )
}

function BackToTop() {
  const [visible, setVisible] = useState(false)
  const { show } = useEntrance()
  const { t } = useLocale()
  const chrome = useCmsChrome()
  const reduce = Boolean(useReducedMotion())

  useEffect(() => {
    if (!chrome.blocksOrder.includes('backTop') || !chrome.showBackToTop) {
      setVisible(false)
      return
    }

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
  }, [chrome.blocksOrder, chrome.showBackToTop])

  if (!chrome.blocksOrder.includes('backTop') || !chrome.showBackToTop) {
    return null
  }
  const fabStyle = fabStyleCss(chrome.backToTop)

  return (
    <AnimatePresence>
      {show && visible ? (
        <motion.button
          type="button"
          className="back-top"
          style={fabStyle}
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
          <SiteIcon
            id={chrome.backToTop.iconId || 'arrow-up'}
            className="header__icon"
            bare
          />
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
  const chrome = useCmsChrome()
  const showLanguage =
    chrome.blocksOrder.includes('language') && chrome.showLanguage
  const showTheme = chrome.blocksOrder.includes('theme') && chrome.showTheme

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

  if (!showLanguage && !showTheme) return null

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
          {showLanguage ? (
            <div className="side-tools__langs" role="group" aria-label={t.chrome.language}>
              {chrome.locales
                .filter((item) => item.enabled)
                .map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    className={`side-tools__lang${locale === item.code ? ' side-tools__lang--active' : ''}`}
                    aria-label={item.label || item.code}
                    aria-pressed={locale === item.code}
                    title={item.label || item.code}
                    onClick={() => setLocale(item.code)}
                  >
                    <span className="side-tools__flag" aria-hidden="true">
                      {chrome.languageMode === 'image' && item.imageUrl ? (
                        <img src={item.imageUrl} alt="" />
                      ) : (
                        item.flagEmoji ||
                        LOCALE_FLAGS[item.code as Locale] ||
                        item.code.toUpperCase()
                      )}
                    </span>
                  </button>
                ))}
            </div>
          ) : null}

          {showLanguage && showTheme ? (
            <span className="side-tools__divider" aria-hidden="true" />
          ) : null}

          {showTheme ? (
            <div className="side-tools__theme">
              <label
                className="ui-switch"
                title={isDark ? t.chrome.themeLight : t.chrome.themeDark}
              >
                <input
                  type="checkbox"
                  checked={isDark}
                  onChange={onToggleTheme}
                  aria-label={isDark ? t.chrome.themeLight : t.chrome.themeDark}
                />
                <div className="slider">
                  <div className="circle">
                    {isDark ? (
                      <Moon weight="bold" />
                    ) : (
                      <Sun weight="bold" />
                    )}
                  </div>
                </div>
              </label>
            </div>
          ) : null}
        </div>

                <button
          type="button"
          className="side-tools__fab"
          style={fabStyleCss(chrome.themeFab)}
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
          <SiteIcon
            id={chrome.themeFab.iconId || 'settings'}
            className="header__icon"
            bare
          />
        </button>
      </div>
    </motion.aside>
  )
}

function Copyright() {
  const { show, reduce } = useEntrance()
  const menuOpen = useMenuOpen()
  const { locale, t } = useLocale()
  const footer = useCmsFooter()
  const visible = show && !menuOpen && footer.enabled
  const line1 =
    footer.slots.includes('line1') && footer.showLine1
      ? footer.line1[locale] || t.chrome.copyrightLine1
      : ''
  const line2 =
    footer.slots.includes('line2') && footer.showLine2
      ? footer.line2[locale] || t.chrome.copyrightLine2
      : ''

  if (!footer.enabled || (!line1 && !line2)) return null

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
          {line1 ? (
            <span style={textStyleCss(footer.line1Style)}>{line1}</span>
          ) : null}
          {line2 ? (
            <span style={textStyleCss(footer.line2Style)}>{line2}</span>
          ) : null}
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

type NewsFabProps = {
  onOpen: () => void
}

function NewsFab({ onOpen }: NewsFabProps) {
  const { show } = useEntrance()
  const { t } = useLocale()
  const chrome = useCmsChrome()
  if (!chrome.blocksOrder.includes('news') || !chrome.showNewsFab) return null

  return (
    <motion.div
      className="news-fab"
      initial="hidden"
      animate={show ? 'show' : 'hidden'}
      variants={fabEntrance}
    >
      <button
        type="button"
        className="side-tools__fab"
        style={fabStyleCss(chrome.newsFab)}
        aria-label={t.chrome.openNews}
        title={t.chrome.news}
        onClick={onOpen}
      >
        <SiteIcon
          id={chrome.newsFab.iconId || 'news'}
          className="header__icon"
          bare
        />
      </button>
    </motion.div>
  )
}

function Menu({ id, open, onNavigate }: MenuProps) {
  const reduce = Boolean(useReducedMotion())
  const state = open ? 'show' : 'hidden'
  const { locale } = useLocale()
  const header = useCmsHeader()
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
    if (isMenuLinkTarget(event.relatedTarget)) return
    // Touch: mantém o preview até outro item ou fechar o menu
    if (window.matchMedia('(hover: none)').matches) return
    setHotPath(null)
    setPaused(false)
  }

  const navLinks = header.modulesOrder.includes('nav')
    ? header.navItems
        .filter((item) => item.enabled)
        .map((item) => ({
          id: item.id,
          label: item.label[locale] || item.name,
          path: item.path,
          description: item.description[locale],
          accents: item.accents[locale],
          accent: (item.accent as ContentPageId | null) ?? null,
          image: item.imageUrl || null,
          labelStyle: item.labelStyle,
          descriptionStyle: item.descriptionStyle,
        }))
    : []

  const socials = header.modulesOrder.includes('social')
    ? header.socials.filter((item) => item.enabled)
    : []

  const previewItem = navLinks.find((item) => item.path === hotPath)
  const previewSrc = previewItem?.image ?? null

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
              key={item.id}
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
                onPointerDown={() => pauseWave(item.path)}
                onPointerEnter={() => pauseWave(item.path)}
                onPointerLeave={resumeWave}
              >
                <motion.span
                  className="menu__link-label"
                  style={{
                    ...(header.navGroupStyle.textColor
                      ? { color: header.navGroupStyle.textColor }
                      : {}),
                    ...textStyleCss({
                      ...header.navGroupStyle.textStyle,
                      ...item.labelStyle,
                      color:
                        item.labelStyle.color ||
                        header.navGroupStyle.textStyle.color ||
                        '',
                      size:
                        item.labelStyle.size !== 'md'
                          ? item.labelStyle.size
                          : header.navGroupStyle.textStyle.size,
                    }),
                  }}
                  variants={reduce ? undefined : menuLabel}
                >
                  {item.label}
                  <span className="menu__link-dot" aria-hidden="true">
                    .
                  </span>
                </motion.span>
                <motion.span
                  className="menu__link-desc"
                  style={{
                    ...(header.navGroupStyle.textColor
                      ? { color: header.navGroupStyle.textColor }
                      : {}),
                    ...textStyleCss(item.descriptionStyle),
                  }}
                  variants={reduce ? undefined : menuDesc}
                >
                  <AccentedText body={item.description} accents={item.accents} />
                </motion.span>
              </a>
            </motion.li>
          ))}
        </ul>
      </motion.nav>

      <div className="menu__preview" aria-hidden="true">
        <AnimatePresence initial={false}>
          {previewSrc ? (
            <motion.div
              key={previewSrc}
              className="menu__preview-enter"
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.92, y: 12 }
              }
              animate={
                reduce
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.96, y: -8 }
              }
              transition={{ duration: reduce ? 0.08 : 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="menu__preview-orbit">
                <img
                  className="menu__preview-img"
                  src={previewSrc}
                  alt=""
                  draggable={false}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <motion.div
        className="menu__footer"
        initial="hidden"
        animate={reduce && open ? 'show' : state}
        variants={menuFooter}
      >
        {socials.map((item) => (
          <motion.a
            key={item.id}
            className="menu__social"
            href={item.href}
            aria-label={item.label}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
            variants={reduce ? undefined : menuSocial}
          >
            <span
              className="menu__social-tip"
              aria-hidden="true"
              style={{
                ...(header.socialGroupStyle.textColor
                  ? { color: header.socialGroupStyle.textColor }
                  : {}),
                ...textStyleCss(item.labelStyle),
              }}
            >
              {item.label}
            </span>
            <SiteIcon
              id={item.iconId || 'external'}
              className="menu__social-icon"
              style={
                header.socialGroupStyle.iconColor
                  ? { color: header.socialGroupStyle.iconColor }
                  : undefined
              }
            />
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

function Hero({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { canAnimate, reduce, playId } = useScrollReveal()
  const scrollViewport = useScrollViewport()
  const hero = useCmsHero()
  const { locale } = useLocale()
  const rise = visibleRiseVariants(reduce)

  return (
    <div id="introduction">
      <motion.div
        key={playId}
        initial="hidden"
        whileInView={canAnimate ? 'show' : 'hidden'}
        viewport={scrollViewport}
        variants={sectionStagger}
      >
        <motion.div variants={rise}>
          <HeroModulesView
            modules={hero.modules}
            locale={locale}
            animated
            onNavigate={onNavigate}
          />
        </motion.div>
      </motion.div>
    </div>
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

function ContentPage({
  pageId,
  actions,
  children,
}: {
  pageId: ContentPageId
  actions?: ReactNode
  children?: ReactNode
}) {
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
            {actions}
          </motion.div>
          <motion.div className="hero__media" variants={rise}>
            <div className="hero__figure">
              <SkeletonImage
                className="hero__figure-img"
                src={meta.image}
                alt={page.imageAlt}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>
      <ScrollCue />
      {children}
      <Copyright />
    </>
  )
}

function AboutHeroActions({ onNavigate }: NavigateProps) {
  const { t } = useLocale()
  const hero = t.pages.about.hero

  return (
    <div className="about-hero__actions">
      <button
        type="button"
        className="works__btn"
        onClick={() => onNavigate(PAGE_META.work.path)}
      >
        {hero.projectsCta}
      </button>
      <a className="works__btn" href="/cv/curriculoAndreVitor.pdf" download>
        {hero.cvCta}
      </a>
    </div>
  )
}

function AboutExtras() {
  return <AboutJourney />
}

function WorkExtras() {
  const { t } = useLocale()
  const stats = t.pages.work.stats

  return (
    <>
      <WorkSkillsMarquee />
      <WorkGithub />

      <section className="work-stats">
        <ul className="work-stats__grid">
          {stats.map((stat) => (
            <li className="work-stats__item" key={stat.label}>
              <p className="work-stats__value">{stat.value}</p>
              <p className="work-stats__label">
                {stat.label}
                <span className="work-stats__hint">{stat.hint}</span>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

function useDocumentTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(readDocumentTheme)

  useEffect(() => {
    const el = document.documentElement
    const observer = new MutationObserver(() => setTheme(readDocumentTheme()))
    observer.observe(el, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  return theme
}

const GITHUB_USERNAME = 'andrecodedev'
const GITHUB_YEARS = ['last', 2026, 2025, 2024] as const
type GithubYear = (typeof GITHUB_YEARS)[number]

function githubStatsUrl(title: string, locale: Locale, dark: boolean) {
  const loc = locale === 'en' ? 'en' : locale === 'es' ? 'es' : 'pt-br'
  const themeParams = dark
    ? 'title_color=ffffff&text_color=a3a3a3&icon_color=26a641&theme=dark'
    : 'title_color=1f2937&text_color=4b5563&icon_color=216e39&theme=light'
  return `https://github-readme-stats-eight-theta.vercel.app/api?username=${GITHUB_USERNAME}&show_icons=true&include_all_commits=true&count_private=true&hide_border=true&custom_title=${encodeURIComponent(title)}&locale=${loc}&${themeParams}&bg_color=00000000`
}

function githubLangsUrl(title: string, locale: Locale, dark: boolean) {
  const loc = locale === 'en' ? 'en' : locale === 'es' ? 'es' : 'pt-br'
  const themeParams = dark
    ? 'title_color=ffffff&text_color=a3a3a3&theme=dark'
    : 'title_color=1f2937&text_color=4b5563&theme=light'
  return `https://github-readme-stats-eight-theta.vercel.app/api/top-langs/?username=${GITHUB_USERNAME}&layout=compact&langs_count=12&hide_border=true&custom_title=${encodeURIComponent(title)}&locale=${loc}&${themeParams}&bg_color=00000000`
}

function WorkGithub() {
  const { t, dictionaryLocale: locale } = useLocale()
  const copy = t.pages.work.github
  const theme = useDocumentTheme()
  const dark = theme === 'dark'
  const [year, setYear] = useState<GithubYear>('last')

  return (
    <section className="work-github" data-accent="work">
      <div className="work-github__card">
        <div className="work-github__head">
          <span className="work-github__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
          </span>
          <h2 className="work-github__title">{copy.heading}</h2>
        </div>

        <div className="work-github__years">
          {GITHUB_YEARS.map((y) => (
            <button
              key={y}
              type="button"
              className={`work-github__year${year === y ? ' is-active' : ''}`}
              onClick={() => setYear(y)}
            >
              {y === 'last' ? copy.yearLast : y}
            </button>
          ))}
        </div>

        <div className="work-github__calendar">
          <GitHubCalendar
            username={GITHUB_USERNAME}
            year={year}
            colorScheme={dark ? 'dark' : 'light'}
            theme={{
              light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
              dark: ['var(--btn-bg)', '#0e4429', '#006d32', '#26a641', '#39d353'],
            }}
            blockRadius={2}
            blockMargin={3}
            blockSize={10}
            labels={{
              legend: { less: copy.legendLess, more: copy.legendMore },
            }}
            tooltips={{
              activity: {
                text: (activity) => `${activity.count} · ${activity.date}`,
              },
            }}
          />
        </div>

        <div className="work-github__stats">
          <SkeletonImage
            frameClassName="work-github__stats-frame"
            className="work-github__stats-img"
            src={githubStatsUrl(copy.statsAlt, locale, dark)}
            alt={copy.statsAlt}
          />
          <SkeletonImage
            frameClassName="work-github__stats-frame"
            className="work-github__stats-img"
            src={githubLangsUrl(copy.langsAlt, locale, dark)}
            alt={copy.langsAlt}
          />
        </div>
      </div>
    </section>
  )
}

const PITCH_VIDEO_ID = 'v2vE1Ac-NxE'

function AboutVideo() {
  const { t } = useLocale()
  const [loaded, setLoaded] = useState(false)
  const [thumb, setThumb] = useState(`https://i.ytimg.com/vi/${PITCH_VIDEO_ID}/maxresdefault.jpg`)

  return (
    <section className="about-video">
      <div className="about-video__frame">
        {loaded ? (
          <iframe
            className="about-video__iframe"
            src={`https://www.youtube.com/embed/${PITCH_VIDEO_ID}?autoplay=1`}
            title={t.pages.about.videoAriaLabel}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="about-video__facade"
            aria-label={t.pages.about.videoAriaLabel}
            onClick={() => setLoaded(true)}
          >
            <SkeletonImage
              frameClassName="about-video__thumb-frame"
              className="about-video__thumb"
              src={thumb}
              alt=""
              onLoad={(e) => {
                // maxresdefault nem sempre existe: quando falta, o YouTube devolve
                // um placeholder cinza 120x90 (sem erro HTTP) em vez de 404.
                if (e.currentTarget.naturalWidth <= 120) {
                  setThumb(`https://i.ytimg.com/vi/${PITCH_VIDEO_ID}/hqdefault.jpg`)
                }
              }}
              onError={() => setThumb(`https://i.ytimg.com/vi/${PITCH_VIDEO_ID}/hqdefault.jpg`)}
            />
            <span className="about-video__play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </span>
          </button>
        )}
      </div>
    </section>
  )
}

/** px/s: velocidade do scroll do marquee (mais baixo = mais lento). */
const SKILLS_MARQUEE_SPEED = 95
/** Raio (px) de influência do efeito de onda ao redor do centro do viewport. */
const SKILLS_WAVE_RADIUS = 340
const SKILLS_WAVE_MIN_SCALE = 0.85
const SKILLS_WAVE_MAX_SCALE = 1.16
const SKILLS_WAVE_MAX_LIFT = 6

/** Curva suave 0→1→0 nas bordas do raio (smoothstep), evita degrau no efeito. */
function waveFactor(distance: number) {
  const t = Math.max(0, 1 - Math.abs(distance) / SKILLS_WAVE_RADIUS)
  return t * t * (3 - 2 * t)
}

function WorkSkillsMarquee() {
  const reduce = Boolean(useReducedMotion())
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const items = reduce ? SKILLS : [...SKILLS, ...SKILLS]

  useEffect(() => {
    if (reduce) return
    const track = trackRef.current
    const viewport = viewportRef.current
    if (!track || !viewport) return

    let centers: number[] = []
    let halfWidth = 0

    const measure = () => {
      centers = itemRefs.current.map((el) =>
        el ? el.offsetLeft + el.offsetWidth / 2 : 0,
      )
      halfWidth = track.scrollWidth / 2
    }
    measure()

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(track)

    let x = 0
    let last = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      x -= SKILLS_MARQUEE_SPEED * dt
      if (halfWidth > 0 && x <= -halfWidth) x += halfWidth
      track.style.transform = `translateX(${x}px)`

      const trackLeft = track.getBoundingClientRect().left
      const viewportRect = viewport.getBoundingClientRect()
      const centerX = viewportRect.left + viewportRect.width / 2

      itemRefs.current.forEach((el, index) => {
        if (!el) return
        const distance = trackLeft + centers[index] - centerX
        const factor = waveFactor(distance)
        const scale =
          SKILLS_WAVE_MIN_SCALE +
          (SKILLS_WAVE_MAX_SCALE - SKILLS_WAVE_MIN_SCALE) * factor
        const lift = (1 - factor) * SKILLS_WAVE_MAX_LIFT
        el.style.transform = `translateY(${lift}px) scale(${scale})`
      })

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
    }
  }, [reduce])

  return (
    <section className="work-skills" aria-hidden="true">
      <div className="work-skills__viewport" ref={viewportRef}>
        <div
          className={`work-skills__track${reduce ? ' work-skills__track--static' : ''}`}
          ref={trackRef}
        >
          {items.map((skill, index) => (
            <div
              className="work-skills__item"
              key={`${skill.name}-${index}`}
              ref={(el) => {
                itemRefs.current[index] = el
              }}
            >
              <img src={skill.icon} alt="" loading="lazy" draggable={false} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AboutAchievements({ items }: { items: readonly AchievementEntry[] }) {
  const carouselItems = useMemo(
    () => items.map((item) => ({ image: item.image, alt: item.title })),
    [items],
  )

  return (
    <div className="about-achievements">
      <div className="about-achievements__stage">
        <DepthCarousel
          items={carouselItems}
          cardWidth={340}
          cardHeight={420}
          radius={10}
          tint="var(--bg-outer)"
          depth={220}
          spread={110}
          tilt={20}
          visibleCards={3}
          falloff={0.28}
          blur={5}
          duration={650}
          renderBack={(_, i) => (
            <>
              <h3 className="about-achievements__back-title">{items[i]?.title}</h3>
              <p className="about-achievements__back-text">{items[i]?.description}</p>
            </>
          )}
        />
      </div>
    </div>
  )
}

function AboutExperienceList({ items }: { items: readonly ExperienceEntry[] }) {
  return (
    <div className="about-experience">
      <LayoutGrid items={items} />
    </div>
  )
}

function AboutHighlightsPanel({
  subtitle,
  items,
}: {
  subtitle: string
  items: readonly HighlightEntry[]
}) {
  const [active, setActive] = useState(items[0]?.id ?? '')
  const current = items.find((item) => item.id === active) ?? items[0]

  return (
    <div className="about-highlights">
      <p className="about-highlights__subtitle">{subtitle}</p>
      <div className="about-highlights__layout">
        <div className="about-highlights__list">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`about-highlights__item${item.id === active ? ' is-active' : ''}`}
              onClick={() => setActive(item.id)}
            >
              {item.title}
            </button>
          ))}
        </div>
        {current ? (
          <div className="about-highlights__panel">
            <div className="about-highlights__panel-content" key={current.id}>
              <h3 className="about-highlights__panel-title">{current.title}</h3>
              {current.description.split('\n\n').map((paragraph, index) => (
                <p className="about-highlights__panel-text" key={index}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

type AboutTabKey = 'achievements' | 'video' | 'experience' | 'details'

function AboutJourney() {
  const { t } = useLocale()
  const page = t.pages.about
  const [tab, setTab] = useState<AboutTabKey>('achievements')

  const tabs: Array<{ key: AboutTabKey; label: string }> = [
    { key: 'achievements', label: page.tabs.achievements },
    { key: 'video', label: page.tabs.video },
    { key: 'experience', label: page.tabs.experience },
    { key: 'details', label: page.tabs.details },
  ]
  const activeLabel = tabs.find((item) => item.key === tab)?.label

  return (
    <section className="about-journey" data-accent="about">
      <div className="about-journey__tabs" role="tablist">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            className={`about-journey__tab${tab === item.key ? ' is-active' : ''}`}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="about-journey__panel">
        <h2 className="about-journey__title">{activeLabel}</h2>

        {tab === 'achievements' ? (
          <AboutAchievements items={page.achievements} />
        ) : tab === 'video' ? (
          <AboutVideo />
        ) : tab === 'experience' ? (
          <AboutExperienceList items={page.experience} />
        ) : (
          <AboutHighlightsPanel subtitle={page.highlights.subtitle} items={page.highlights.items} />
        )}
      </div>
    </section>
  )
}

function HomePage({ onNavigate }: NavigateProps) {
  const { t } = useLocale()

  return (
    <>
      <Hero onNavigate={onNavigate} />
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
  const location = useLocation()
  const chrome = useCmsChrome()
  const pageAccent = getAccentForPath(location.pathname)
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
  const [theme, setTheme] = useState<Theme>(readDocumentTheme)
  const [gateOpen, setGateOpen] = useState(false)
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

  useEffect(() => {
    if (bootVisible) return

    const timer = window.setTimeout(() => {
      setGateOpen(true)
    }, 600)

    return () => window.clearTimeout(timer)
  }, [bootVisible])

  useEffect(() => {
    if (!gateOpen || menuOpen || bootVisible) return

    lockPageScroll()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setGateOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      unlockPageScroll()
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [gateOpen, menuOpen, bootVisible])

  const handleBootExitComplete = () => {
    setBootVisible(false)
    unlockPageScroll()
  }

  const dismissGate = () => {
    setGateOpen(false)
  }

  const navigateTo = (path: string) => {
    setMenuOpen(false)
    goTo(path)
  }

  const pageClass = [
    'page',
    menuBlocksChrome ? 'page--menu-open' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <RevealProvider ready={revealReady}>
      <MenuOpenProvider open={menuBlocksChrome}>
        <div
          className={pageClass}
          data-accent={pageAccent ?? undefined}
        >
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
          <div className="stage-panel stage-panel--header">
            <Header
              menuOpen={menuOpen}
              menuId={menuId}
              pinned={menuOpen || gateOpen}
              onToggleMenu={() => setMenuOpen((open) => !open)}
              onGoHome={() => navigateTo('/')}
              onHireMe={(path) => {
                if (/^(https?:\/\/|mailto:|tel:)/i.test(path.trim())) {
                  window.open(path, '_blank', 'noopener,noreferrer')
                  return
                }
                navigateTo(path)
              }}
            />
          </div>
          <div className="corner-tools">
            <BackToTop />
            <NewsFab onOpen={() => setGateOpen(true)} />
            <SideTools
              theme={theme}
              onToggleTheme={() =>
                setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
              }
            />
          </div>
          <div className="stage-panel stage-panel--gate">
            <GatePopup
              open={gateOpen && !menuOpen && !bootVisible}
              onClose={dismissGate}
              onNavigate={(path) => {
                dismissGate()
                navigateTo(path)
              }}
            />
          </div>
          <div className="stage-panel stage-panel--menu">
            <Menu id={menuId} open={menuOpen} onNavigate={navigateTo} />
          </div>
          <div className="stage" aria-hidden="true">
            <div className="stage__rain">
              {chrome.blocksOrder.includes('rain') ? (
                <CodeRain config={chrome.rain} />
              ) : null}
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
                  element={
                    <ContentPage pageId="work">
                      <WorkExtras />
                    </ContentPage>
                  }
                />
                <Route
                  path={PAGE_META.about.path}
                  element={
                    <ContentPage
                      pageId="about"
                      actions={<AboutHeroActions onNavigate={navigateTo} />}
                    >
                      <AboutExtras />
                    </ContentPage>
                  }
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
        <CmsProvider>
          <Routes>
            <Route path={ADMIN_BASE_PATH} element={<AdminAuth />} />
            <Route path={ADMIN_DASHBOARD_PATH} element={<AdminDashboard />} />
            <Route path="*" element={<PortfolioShell />} />
          </Routes>
        </CmsProvider>
      </LocaleProvider>
    </BrowserRouter>
  )
}

export default App
