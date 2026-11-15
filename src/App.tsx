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
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom'
import { GitHubCalendar } from 'react-github-calendar'
import { AccentedText } from './components/accented-text'
import { DepthCarousel } from './components/depth-carousel'
import CircularCarousel from './components/circular-carousel'
import InfiniteSpiral from './components/infinite-spiral'
import DriftWall from './components/drift-wall'
import FlexCarousel from './components/flex-carousel'
import BounceCards from './components/bounce-cards'
import { BLOG_POSTS, findBlogPost, formatBlogDate, type BlogBlock } from './data/blog-posts'
import AccordionGallery from './components/accordion-gallery'
import { ClientsFolders } from './components/clients-folders'
import ChromaGrid from './components/chroma-grid'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  ChatCircleDots,
  Code,
  GraduationCap,
  Stack,
  type Icon,
} from '@phosphor-icons/react'
import CircularGallery from './components/circular-gallery'
import { LayoutGrid } from './components/layout-grid'
import CodeRain from './components/CodeRain'
import NotFoundPage from './components/not-found'
import { SkeletonImage } from './components/skeleton-image'
import { applyTheme, readDocumentTheme, type Theme } from './theme'
import SideTools from './components/side-tools'
import {
  ASSETS,
  PAGE_META,
  getAccentForPath,
  getLoaderBgForPath,
  isKnownSitePath,
  type ContentPageId,
} from './data/site'
import { SKILLS } from './data/about'
import {
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
  useCmsGate,
  useCmsHeader,
  useCmsHero,
} from './cms/cms-provider'
import { fabStyleCss } from './cms/chrome-content'
import { headerChromeCss } from './cms/header-content'
import { SiteIcon } from './cms/icon-registry'
import { buttonStyleCss, textStyleCss } from './cms/style-tokens'
import GatePopup from './cms/gate-popup'
import { gateIsAvailable } from './cms/gate-content'
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
  ScrollFade,
  ScrollFadeItem,
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

const SCROLL_CUE_WORD = { pt: 'DESLIZAR', en: 'SCROLL', es: 'DESPLAZA' } as const

function ScrollCue() {
  const { dictionaryLocale } = useLocale()
  const letters = Array.from(SCROLL_CUE_WORD[dictionaryLocale])
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
type AccentTone = 'work' | 'about' | 'reading' | 'blog' | 'hire' | 'contact'

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

type FanItem = {
  key: string
  title: string
  text: string
  Icon: Icon
  to?: string
}

/** Conteúdo provisório dos cards da sanfona (Sobre) até haver texto definitivo. */
const FAN_ITEMS: FanItem[] = [
  { key: 'study', title: 'Formação', text: 'ETEC e Facens, ADS', Icon: GraduationCap },
  { key: 'xp', title: 'Experiência', text: 'Desenvolvedor Web na TEC4U', Icon: Briefcase },
  { key: 'stack', title: 'Stack', text: 'React, Node e banco de dados', Icon: Code },
  { key: 'work', title: 'Projetos', text: 'Casos reais e estudos', Icon: Stack, to: PAGE_META.work.path },
  { key: 'contact', title: 'Contato', text: 'Vamos conversar', Icon: ChatCircleDots, to: PAGE_META.contact.path },
]

function FanCard({ item, onNavigate }: { item: FanItem; onNavigate: (to: string) => void }) {
  const { Icon } = item
  const inner = (
    <>
      <span className="fan-card__icon">
        <Icon size={22} weight="bold" aria-hidden="true" />
      </span>
      <span className="fan-card__copy">
        <span className="fan-card__title">{item.title}</span>
        <span className="fan-card__text">{item.text}</span>
      </span>
    </>
  )
  const to = item.to
  if (to) {
    return (
      <button type="button" className={`fan-card fan-card--${item.key}`} onClick={() => onNavigate(to)}>
        {inner}
      </button>
    )
  }
  return <div className={`fan-card fan-card--${item.key}`}>{inner}</div>
}

function AboutFan({ onNavigate }: NavigateProps) {
  return (
    <section className="page-block about-fan" data-accent="about">
      <div className="about-fan__stack">
        <BounceCards
          containerWidth={1360}
          containerHeight={200}
          cardWidth={385}
          cardHeight={128}
          spread={235}
          rotation={6}
          pushDistance={150}
        >
          {FAN_ITEMS.map((item) => (
            <FanCard key={item.key} item={item} onNavigate={onNavigate} />
          ))}
        </BounceCards>
      </div>
      <div className="about-fan__grid">
        {FAN_ITEMS.map((item) => (
          <FanCard key={item.key} item={item} onNavigate={onNavigate} />
        ))}
      </div>
    </section>
  )
}

const FLEX_IMAGES = Array.from({ length: 12 }, (_, i) => `/showcase/galeria-${String(i + 1).padStart(2, '0')}.jpg`)

function AboutExtras({ onNavigate }: NavigateProps) {
  const isMobile = useIsMobile()
  const { t } = useLocale()
  const flexLabels = t.pages.about.gallery.labels
  return (
    <>
      <AboutFan onNavigate={onNavigate} />
      <AboutJourney />
      <section className="page-block showcase-flex">
        <FlexCarousel
          items={FLEX_IMAGES.map((src, index) => ({
            src,
            alt: flexLabels[index],
            title: flexLabels[index],
          }))}
          preset="liquid"
          intro="rise"
          cardHeight={isMobile ? 0.46 : 0.5}
          gap={12}
          squeeze={0.2}
          focusOnClick
          captions
          fit="natural"
          radius={0}
          lensWidth={0.74}
          lensHeight={1.18}
          tilt={62}
          roundness={1}
          bend={isMobile ? 0.2 : 0.34}
          reach={0.38}
          curl="twist"
          dispersion={isMobile ? 0.3 : 0.45}
          liquid={0}
          followCursor={false}
          autoplay={false}
          interval={4}
          captureWheel={false}
        />
      </section>
    </>
  )
}

const STUDY_ACCENTS = ['#61dafb', '#68d391', '#60a5fa', '#fbbf24', '#f472b6', '#a78bfa']

function BlogTags({ tags }: { tags: string[] }) {
  return (
    <ul className="blog-tags">
      {tags.map((tag) => (
        <li className="blog-tags__item" key={tag}>
          {tag}
        </li>
      ))}
    </ul>
  )
}

function BlogCard({
  post,
  onNavigate,
}: {
  post: (typeof BLOG_POSTS)[number]
  onNavigate: (path: string) => void
}) {
  const { t, dictionaryLocale } = useLocale()
  const blog = t.pages.blog
  const content = post.content[dictionaryLocale]
  const path = `${PAGE_META.blog.path}/${post.slug}`

  return (
    <li className="blog-card">
      <a
        className="blog-card__link"
        href={path}
        onClick={(event) => {
          // Mantém a transição de página do site (sem recarregar).
          event.preventDefault()
          onNavigate(path)
        }}
      >
        <span className="blog-card__meta">
          {formatBlogDate(post.date, dictionaryLocale)} · {post.readMinutes} {blog.minRead}
        </span>
        <h3 className="blog-card__title">{content.title}</h3>
        <p className="blog-card__excerpt">{content.excerpt}</p>
        <BlogTags tags={post.tags} />
        <span className="blog-card__cta">
          {blog.readMore}
          <ArrowRight weight="bold" aria-hidden />
        </span>
      </a>
    </li>
  )
}

/** /blog: lista de posts (abaixo do hero da página). */
function BlogExtras({ onNavigate }: NavigateProps) {
  const { t } = useLocale()
  const blog = t.pages.blog

  return (
    <section className="page-block about-journey" data-accent="blog">
      <h2 className="about-journey__title">{blog.listHeading}</h2>
      {BLOG_POSTS.length === 0 ? (
        <p className="blog-empty">{blog.empty}</p>
      ) : (
        <ul className="blog-list">
          {BLOG_POSTS.map((post) => (
            <BlogCard key={post.slug} post={post} onNavigate={onNavigate} />
          ))}
        </ul>
      )}
    </section>
  )
}

function renderBlogBlock(block: BlogBlock, index: number) {
  if (block.type === 'h2') return <h2 key={index}>{block.text}</h2>
  if (block.type === 'quote') return <blockquote key={index}>{block.text}</blockquote>
  if (block.type === 'list')
    return (
      <ul key={index}>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )
  if (block.type === 'code')
    return (
      <pre key={index}>
        <code>{block.text}</code>
      </pre>
    )
  return <p key={index}>{block.text}</p>
}

/** /blog/:slug: página de um post. */
function BlogPostPage({ onNavigate }: NavigateProps) {
  const { t, dictionaryLocale } = useLocale()
  const blog = t.pages.blog
  const { slug = '' } = useParams()
  const post = findBlogPost(slug)
  const others = BLOG_POSTS.filter((item) => item.slug !== slug)

  return (
    <>
      <article className="blog-post" data-accent="blog">
        <button
          type="button"
          className="blog-post__back"
          onClick={() => onNavigate(PAGE_META.blog.path)}
        >
          <ArrowLeft weight="bold" aria-hidden />
          {blog.backToList}
        </button>

        {post ? (
          <>
            <header className="blog-post__head">
              <p className="blog-post__meta">
                {blog.publishedOn} {formatBlogDate(post.date, dictionaryLocale)} · {post.readMinutes}{' '}
                {blog.minRead}
              </p>
              <h1 className="blog-post__title">{post.content[dictionaryLocale].title}</h1>
              <BlogTags tags={post.tags} />
            </header>
            <div className="blog-post__body">
              {post.content[dictionaryLocale].body.map(renderBlogBlock)}
            </div>
          </>
        ) : (
          <p className="blog-empty">{blog.empty}</p>
        )}
      </article>

      {others.length > 0 ? (
        <section className="page-block about-journey" data-accent="blog">
          <h2 className="about-journey__title">{blog.moreHeading}</h2>
          <ul className="blog-list">
            {others.map((item) => (
              <BlogCard key={item.slug} post={item} onNavigate={onNavigate} />
            ))}
          </ul>
        </section>
      ) : null}
      <Copyright />
    </>
  )
}

function ReadingExtras() {
  const { t } = useLocale()
  const studies = t.pages.reading.studies

  return (
    <>
      <section className="page-block about-journey" data-accent="reading">
        <h2 className="about-journey__title">{studies.heading}</h2>
        <ChromaGrid
          items={studies.items.map((item, index) => ({
            image: `/showcase/projeto-${index + 1}.svg`,
            title: item.title,
            subtitle: item.subtitle,
            accent: STUDY_ACCENTS[index % STUDY_ACCENTS.length],
          }))}
          columns={3}
          minCardWidth={220}
          gap={14}
          radius={260}
          reveal="spotlight"
          aspectRatio="3 / 2"
          cardRadius={14}
          softness={0.6}
          damping={0.45}
          fadeOut={0.6}
          grayscale={1}
          dim={0.12}
          glow={0.5}
          borderGlow={1}
        />
      </section>

      <section className="page-block showcase-drift">
        <DriftWall
          columns={5}
          tileWidth={200}
          tileHeight={132}
          gap={18}
          tilt={16}
          turn={-14}
          perspective={1200}
          depth={120}
          speed={42}
          direction="up"
          variance={0.45}
          parallax={0.6}
          lift={64}
          fade={0.6}
          dim={0.55}
          overlayColor="#060010"
          radius={14}
          roll={0}
          pauseOnHover={false}
          grayscale={false}
        />
      </section>
    </>
  )
}

function HireExtras() {
  return (
    <>
      <section className="page-block showcase-circular">
        <CircularCarousel
          preset="cylinder"
          intro="rise"
          cardWidth={220}
          aspectRatio={1}
          speed={14}
          gap={25}
          tilt={-5}
          curve={1}
          perspective={2500}
          autoplay="drift"
          direction="left"
          momentum={0.6}
          fadeColor="#000000"
          depthFade={0.55}
          innerShade={0.6}
          cornerRadius={12}
        />
      </section>
    </>
  )
}

function ContactExtras() {
  return (
    <>
      <section className="page-block showcase-spiral">
        <InfiniteSpiral
          items={SPIRAL_IMAGES}
          animationMode="auto"
          speed={0.55}
          radius={170}
          cardWidth={100}
          cardHeight={100}
          verticalSpacing={60}
          perspective={1000}
          cardRadius={10}
          centerScale={1.2}
          edgeBlur={6}
          cardsPerTurn={7}
          pauseOnHover
          direction="up"
          rotation={0}
          cardTilt={0}
          edgeFade={0.3}
          imageFit="cover"
          grayscale={1}
        />
      </section>
    </>
  )
}

function useIsMobile() {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  )
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    const update = () => setMobile(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return mobile
}

function WorkExtras() {
  const { t } = useLocale()
  const isMobile = useIsMobile()
  const galleryDark = useDocumentTheme() === 'dark'
  const stats = t.pages.work.stats

  return (
    <>
      <WorkSkillsMarquee />
      <WorkGithub />

      <ScrollFade className="page-block work-stats" stagger={0.09}>
        <ul className="work-stats__grid">
          {stats.map((stat) => (
            <ScrollFadeItem as="li" className="work-stats__item" key={stat.label}>
              <p className="work-stats__value">{stat.value}</p>
              <p className="work-stats__label">{stat.label}</p>
            </ScrollFadeItem>
          ))}
        </ul>
      </ScrollFade>

      <ScrollFade className="page-block about-journey" data-accent="work">
        <h2 className="about-journey__title">{t.pages.about.tabs.experience}</h2>
        <AboutExperienceList items={t.pages.about.experience} accent="work" />
      </ScrollFade>

      <section className="page-block about-journey" data-accent="work">
        <h2 className="about-journey__title">{t.pages.work.clients.heading}</h2>
        <ClientsFolders clients={t.pages.work.clients} isMobile={isMobile} />
      </section>

      <section className="page-block showcase-gallery">
        <h2 className="showcase-gallery__title">{t.pages.work.gallery.heading}</h2>
        <div className="showcase-gallery__stage">
        <CircularGallery
          items={GALLERY_ITEMS}
          bend={3}
          textColor={galleryDark ? '#ffffff' : '#171717'}
          borderRadius={0.05}
          scrollEase={0.05}
          itemSize={0.84}
          bottomSpace={isMobile ? 64 : 110}
          itemAspect={1.6}
          gap={0.26}
          wave={1}
          fadeEdges={0.12}
          shadow={0.25}
          scrollSpeed={2}
          autoScroll={0}
          snap
          grayscale={false}
          showTitles
          openOnClick
          intro
        />
        </div>
      </section>
    </>
  )
}

/** Cards de exemplo da galeria (prints de páginas, em /public/showcase) até haver projetos reais. */
const GALLERY_ITEMS = [
  ['Landing page', 'Página de captação com foco em conversão.'],
  ['Loja virtual', 'Catálogo, carrinho e checkout integrados.'],
  ['Painel admin', 'Dashboard com métricas e gestão de conteúdo.'],
  ['Site institucional', 'Identidade da marca em várias páginas.'],
  ['Portfólio', 'Vitrine de projetos com animações.'],
  ['Aplicativo web', 'Interface rápida para o dia a dia.'],
].map(([text, description], index) => ({
  image: `/showcase/projeto-${index + 1}.svg`,
  text,
  description,
}))

/** Imagens provisórias da galeria de momentos (Sobre): artes em /public/showcase. Trocar por fotos reais. */
const ACCORDION_IMAGES = [1, 2, 3, 4, 5].map((n) => `/showcase/accordion-${n}.svg`)

/** Imagens genéricas locais (Contato) até você definir o conteúdo real. */
const SPIRAL_IMAGES = [1, 2, 4, 5, 7, 9, 10, 11].map((n) => ({
  src: `/showcase/galeria-${String(n).padStart(2, '0')}.jpg`,
  alt: `Imagem ${n}`,
}))

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
const GITHUB_BLOCK_MARGIN = 4
const GITHUB_YEARS = ['last', 2026, 2025, 2024] as const
type GithubYear = (typeof GITHUB_YEARS)[number]

/** Mesma instância de github-readme-stats usada no README do perfil (dados reais, incl. privados). */
const GITHUB_STATS_HOST = 'https://github-readme-stats-livid-seven-19.vercel.app'

function githubStatsUrl(title: string, locale: Locale, dark: boolean) {
  const loc = locale === 'en' ? 'en' : locale === 'es' ? 'es' : 'pt-br'
  const themeParams = dark
    ? 'title_color=ffffff&text_color=a3a3a3&icon_color=26a641&theme=dark'
    : 'title_color=1f2937&text_color=4b5563&icon_color=216e39&theme=default'
  return `${GITHUB_STATS_HOST}/api?username=${GITHUB_USERNAME}&show_icons=true&include_all_commits=true&count_private=true&hide_border=true&custom_title=${encodeURIComponent(title)}&locale=${loc}&${themeParams}&bg_color=00000000`
}

function githubLangsUrl(title: string, locale: Locale, dark: boolean) {
  const loc = locale === 'en' ? 'en' : locale === 'es' ? 'es' : 'pt-br'
  const themeParams = dark
    ? 'title_color=ffffff&text_color=a3a3a3&theme=dark'
    : 'title_color=1f2937&text_color=4b5563&theme=default'
  return `${GITHUB_STATS_HOST}/api/top-langs/?username=${GITHUB_USERNAME}&layout=compact&langs_count=12&card_width=495&hide_border=true&custom_title=${encodeURIComponent(title)}&locale=${loc}&${themeParams}&bg_color=00000000`
}

function WorkGithub() {
  const { t, dictionaryLocale: locale } = useLocale()
  const copy = t.pages.work.github
  const theme = useDocumentTheme()
  const dark = theme === 'dark'
  const [year, setYear] = useState<GithubYear>('last')
  const calendarRef = useRef<HTMLDivElement>(null)
  const [blockSize, setBlockSize] = useState(10)

  // Ajusta o tamanho dos quadradinhos à largura disponível: o calendário
  // (53 semanas) preenche o card em vez de ficar estreito no meio.
  useEffect(() => {
    const el = calendarRef.current
    if (!el) return
    const update = () => {
      const free = el.clientWidth - 40 // espaço para os rótulos de dias/meses
      const size = Math.floor(free / 53 - GITHUB_BLOCK_MARGIN)
      setBlockSize(Math.min(12, Math.max(8, size)))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <ScrollFade className="page-block work-github" data-accent="work">
      <div className="work-github__card">
        <div className="work-github__head">
          <SiteIcon id="github" className="work-github__icon" />
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

        <div className="work-github__calendar" ref={calendarRef}>
          <GitHubCalendar
            username={GITHUB_USERNAME}
            year={year}
            colorScheme={dark ? 'dark' : 'light'}
            style={{ color: 'var(--text)' }}
            theme={{
              light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
              dark: ['rgba(255,255,255,0.07)', '#0e4429', '#006d32', '#26a641', '#39d353'],
            }}
            blockRadius={2}
            blockMargin={GITHUB_BLOCK_MARGIN}
            blockSize={blockSize}
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

        {/* As duas versões (escuro e claro) ficam no DOM e o CSS mostra a do tema atual:
            trocar de tema não recarrega as imagens (antes piscava e "bugava"). */}
        <div className="work-github__stats">
          {([true, false] as const).map((isDark) => (
            <div
              key={isDark ? 'dark' : 'light'}
              className={`work-github__variant work-github__variant--${isDark ? 'dark' : 'light'}`}
            >
              <SkeletonImage
                frameClassName="work-github__stats-frame"
                className="work-github__stats-img"
                src={githubStatsUrl(copy.statsAlt, locale, isDark)}
                alt={copy.statsAlt}
              />
              <SkeletonImage
                frameClassName="work-github__stats-frame"
                className="work-github__stats-img"
                src={githubLangsUrl(copy.langsAlt, locale, isDark)}
                alt={copy.langsAlt}
              />
            </div>
          ))}
        </div>
      </div>
    </ScrollFade>
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
const SKILLS_MARQUEE_SPEED = 55

function WorkSkillsMarquee() {
  const reduce = Boolean(useReducedMotion())
  const trackRef = useRef<HTMLDivElement>(null)
  const items = reduce ? SKILLS : [...SKILLS, ...SKILLS]

  useEffect(() => {
    if (reduce) return
    const track = trackRef.current
    if (!track) return

    let halfWidth = 0

    const measure = () => {
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

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
    }
  }, [reduce])

  return (
    <ScrollFade className="page-block work-skills" aria-hidden="true">
      <div className="work-skills__viewport">
        <div
          className={`work-skills__track${reduce ? ' work-skills__track--static' : ''}`}
          ref={trackRef}
        >
          {items.map((skill, index) => (
            <div
              className="work-skills__item"
              key={`${skill.name}-${index}`}
            >
              <img src={skill.icon} alt="" loading="lazy" draggable={false} />
            </div>
          ))}
        </div>
      </div>
    </ScrollFade>
  )
}

function AboutAchievements({ items }: { items: readonly AchievementEntry[] }) {
  const isMobile = useIsMobile()
  const dark = useDocumentTheme() === 'dark'
  const carouselItems = useMemo(
    () => items.map((item) => ({ image: item.image, alt: item.title })),
    [items],
  )

  return (
    <div className="about-achievements">
      <div className="about-achievements__stage">
        <DepthCarousel
          items={carouselItems}
          indicator="counter"
          cardWidth={isMobile ? 260 : 440}
          cardHeight={isMobile ? 350 : 560}
          radius={10}
          tint="var(--bg-outer)"
          depth={isMobile ? 160 : 220}
          spread={isMobile ? 50 : 110}
          tilt={isMobile ? 14 : 20}
          visibleCards={2}
          // No claro, escurecer os cards de trás vira "mancha preta": usa bem menos.
          falloff={dark ? 0.28 : 0.1}
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

function AboutExperienceList({
  items,
  accent,
}: {
  items: readonly ExperienceEntry[]
  accent?: string
}) {
  return (
    <div className="about-experience">
      <LayoutGrid items={items} accent={accent} />
    </div>
  )
}

function AboutHighlightsPanel({ items }: { items: readonly HighlightEntry[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '')
  const current = items.find((item) => item.id === active) ?? items[0]
  const listRef = useRef<HTMLDivElement>(null)
  const swipeRef = useRef<{ x: number; y: number } | null>(null)

  // Seleciona um item e, no celular (lista rolável na horizontal), traz o chip para o início.
  const select = (id: string) => {
    setActive(id)
    const list = listRef.current
    const chip = list?.querySelector<HTMLElement>(`[data-hid="${id}"]`)
    if (list && chip && list.scrollWidth > list.clientWidth) {
      list.scrollTo({ left: chip.offsetLeft - list.offsetLeft, behavior: 'smooth' })
    }
  }

  const step = (delta: number) => {
    const index = items.findIndex((item) => item.id === current?.id)
    const next = items[index + delta]
    if (next) select(next.id)
  }

  return (
    <div className="about-highlights">
      <div className="about-highlights__layout">
        <div className="about-highlights__list" ref={listRef}>
          {items.map((item, index) => (
            <button
              key={item.id}
              data-hid={item.id}
              type="button"
              className={`about-highlights__item${item.id === active ? ' is-active' : ''}`}
              onClick={() => select(item.id)}
            >
              <span className="about-highlights__index">{String(index + 1).padStart(2, '0')}</span>
              <span className="about-highlights__item-title">{item.title}</span>
            </button>
          ))}
        </div>
        {current ? (
          <div
            className="about-highlights__panel"
            // Deslizar para o lado no card troca de item (toque).
            onPointerDown={(event) => {
              if (event.pointerType === 'mouse') return
              swipeRef.current = { x: event.clientX, y: event.clientY }
            }}
            onPointerUp={(event) => {
              const start = swipeRef.current
              swipeRef.current = null
              if (!start) return
              const dx = event.clientX - start.x
              const dy = event.clientY - start.y
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1)
            }}
            onPointerCancel={() => {
              swipeRef.current = null
            }}
          >
            <div className="about-highlights__panel-content" key={current.id}>
              <span className="about-highlights__panel-index" aria-hidden="true">
                {String(items.findIndex((item) => item.id === current.id) + 1).padStart(2, '0')}
              </span>
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

/**
 * Sobre: ordem narrativa (quem sou -> como penso -> onde atuei -> o que conquistei).
 * Vídeo não leva título (o próprio player já se explica); sanfona e carrossel final
 * também ficam sem título, em AboutExtras.
 */
function AboutJourney() {
  const { t } = useLocale()
  const page = t.pages.about
  const isMobile = useIsMobile()
  const dark = useDocumentTheme() === 'dark'

  return (
    <>
      <ScrollFade className="page-block about-journey" data-accent="about" aria-label={page.tabs.video}>
        <AboutVideo />
      </ScrollFade>
      <ScrollFade className="page-block about-journey" data-accent="about">
        <h2 className="about-journey__title">{page.tabs.details}</h2>
        <AboutHighlightsPanel items={page.highlights.items} />
      </ScrollFade>
      <ScrollFade className="page-block about-journey" data-accent="about">
        <h2 className="about-journey__title">{page.tabs.achievements}</h2>
        <AboutAchievements items={page.achievements} />
      </ScrollFade>
      <section className="page-block about-accordion" data-accent="about">
        <h2 className="about-journey__title">{page.moments.heading}</h2>
        <AccordionGallery
          key={isMobile ? 'mobile' : 'desktop'}
          items={ACCORDION_IMAGES.map((image, index) => ({
            image,
            label: page.moments.labels[index],
          }))}
          // Celular: faixas na horizontal (orientação vertical), com a última aberta:
          // as fechadas ficam em cima e a foto grande embaixo, boa para imagem horizontal.
          orientation={isMobile ? 'vertical' : 'horizontal'}
          defaultIndex={isMobile ? ACCORDION_IMAGES.length - 1 : 2}
          expandRatio={isMobile ? 0.6 : 0.52}
          trigger="hover"
          accentColor="var(--section-accent)"
          overlayColor="var(--bg-outer)"
          // Sem sombra no texto; a cor acompanha o tema (branco sobre fundo claro sumia).
          textColor={dark ? '#ffffff' : '#171717'}
          grayscale
          showLabels
          duration={0.6}
          ease="power3.out"
          parallax={0.5}
          tilt={isMobile ? 0 : 8}
          stagger={0.06}
          height={isMobile ? 360 : 460}
          gap={isMobile ? 6 : 10}
          radius={10}
          showInactiveLabels={isMobile}
        />
      </section>
    </>
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
        id="blog"
        ariaLabel={t.home.blog.ariaLabel}
        align="end"
        accent="blog"
        titleLine1={t.home.blog.titleLines[0]}
        titleLine2={t.home.blog.titleLines[1]}
        text={
          <AccentedText
            body={t.home.blog.body}
            accents={t.home.blog.accents}
          />
        }
        ctaLabel={t.home.blog.cta}
        to={PAGE_META.blog.path}
        onNavigate={onNavigate}
      />
      <Spot
        id="contrato"
        ariaLabel={t.home.hire.ariaLabel}
        align="start"
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
        align="end"
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
  const isNotFound = !isKnownSitePath(location.pathname)
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
  const [gateRequested, setGateOpen] = useState(false)
  const gateAvailable = gateIsAvailable(useCmsGate())
  // Pop-up desligado (ou sem slide ativo) nunca abre: sem fundo escuro, sem trava de scroll.
  const gateOpen = gateRequested && gateAvailable
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
    if (bootVisible || isNotFound || !gateAvailable) return

    const timer = window.setTimeout(() => {
      setGateOpen(true)
    }, 600)

    return () => window.clearTimeout(timer)
  }, [bootVisible, isNotFound, gateAvailable])

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
    isNotFound ? 'page--not-found' : '',
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
            {!isNotFound ? <BackToTop /> : null}
            {gateAvailable ? <NewsFab onOpen={() => setGateOpen(true)} /> : null}
            <SideTools
              theme={theme}
              onToggleTheme={() =>
                setTheme((current) =>
                  current === 'dark' ? 'light' : 'dark',
                )
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
                    <ContentPage pageId="about">
                      <AboutExtras onNavigate={navigateTo} />
                    </ContentPage>
                  }
                />
                <Route
                  path={PAGE_META.reading.path}
                  element={
                    <ContentPage pageId="reading">
                      <ReadingExtras />
                    </ContentPage>
                  }
                />
                <Route
                  path={PAGE_META.blog.path}
                  element={
                    <ContentPage pageId="blog">
                      <BlogExtras onNavigate={navigateTo} />
                    </ContentPage>
                  }
                />
                <Route
                  path={`${PAGE_META.blog.path}/:slug`}
                  element={<BlogPostPage onNavigate={navigateTo} />}
                />
                <Route
                  path={PAGE_META.hire.path}
                  element={
                    <ContentPage pageId="hire">
                      <HireExtras />
                    </ContentPage>
                  }
                />
                <Route
                  path={PAGE_META.contact.path}
                  element={
                    <ContentPage pageId="contact">
                      <ContactExtras />
                    </ContentPage>
                  }
                />
                <Route
                  path="*"
                  element={<NotFoundPage onGoHome={() => navigateTo('/')} />}
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
            <Route
              path={`${ADMIN_BASE_PATH}/*`}
              element={<Navigate to={ADMIN_BASE_PATH} replace />}
            />
            <Route path="*" element={<PortfolioShell />} />
          </Routes>
        </CmsProvider>
      </LocaleProvider>
    </BrowserRouter>
  )
}

export default App
