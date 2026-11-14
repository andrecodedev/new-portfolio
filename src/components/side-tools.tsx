import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun } from '@phosphor-icons/react'
import { fabStyleCss } from '../cms/chrome-content'
import { useCmsChrome } from '../cms/cms-provider'
import { SiteIcon } from '../cms/icon-registry'
import { LOCALE_FLAGS, type Locale } from '../i18n/copy'
import { useLocale } from '../i18n/LocaleProvider'
import { fabEntrance, useEntrance } from '../motion/reveal'
import type { Theme } from '../theme'

type SideToolsProps = {
  theme: Theme
  onToggleTheme: () => void
  /** Sem animação de entrada (login/admin fora do RevealProvider). */
  immediate?: boolean
  /** Força idioma+tema mesmo se o CMS tiver escondido no site. */
  forceShow?: boolean
}

export default function SideTools({
  theme,
  onToggleTheme,
  immediate = false,
  forceShow = false,
}: SideToolsProps) {
  const isDark = theme === 'dark'
  const rootRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const [touchMode, setTouchMode] = useState(false)
  const { show } = useEntrance()
  const { locale, setLocale, t } = useLocale()
  const chrome = useCmsChrome()
  const showLanguage =
    forceShow ||
    (chrome.blocksOrder.includes('language') && chrome.showLanguage)
  const showTheme =
    forceShow || (chrome.blocksOrder.includes('theme') && chrome.showTheme)
  const visible = immediate || show

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
      initial={immediate ? false : 'hidden'}
      animate={visible ? 'show' : 'hidden'}
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
            <div
              className="side-tools__langs"
              role="group"
              aria-label={t.chrome.language}
            >
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
                    {isDark ? <Moon weight="bold" /> : <Sun weight="bold" />}
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
