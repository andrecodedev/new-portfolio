import { Moon } from '@phosphor-icons/react'
import { useRef, useState, type ReactNode } from 'react'
import CodeRain from '../components/CodeRain'
import type { CmsChromePayload } from '../cms/chrome-content'
import { fabStyleCss } from '../cms/chrome-content'
import { cmsEditAttrs, cmsEditClass } from '../cms/cms-edit'
import type { CmsFooterPayload } from '../cms/footer-content'
import {
  headerChromeCss,
  type CmsHeaderPayload,
} from '../cms/header-content'
import type { CmsHeroPayload } from '../cms/hero-content'
import { SiteIcon } from '../cms/icon-registry'
import {
  HeroModulesView,
  type PreviewDevice,
} from '../cms/hero-stack'
import { buttonStyleCss, textStyleCss } from '../cms/style-tokens'
import { AccentedText } from '../components/accented-text'
import type { Locale } from '../i18n/copy'

type EditProps = {
  editMode?: boolean
  editSelectedId?: string | null
}

function SiteStage({ children }: { children: ReactNode }) {
  return <div className="admin-site-stage">{children}</div>
}

export function HeaderBarPreview({
  data,
  locale,
  menuOpen = false,
  editMode,
  editSelectedId,
}: {
  data: CmsHeaderPayload
  locale: Locale | string
  menuOpen?: boolean
} & EditProps) {
  const menuLabel = menuOpen
    ? data.menuClose[locale] || data.menuClose.pt
    : data.menuOpen[locale] || data.menuOpen.pt
  const ctaLabel = data.ctaLabel[locale] || data.ctaLabel.pt

  return (
    <header
      className={`header${editMode ? ` ${cmsEditClass(editSelectedId, 'header')}` : ''}`}
      style={headerChromeCss(data.chromeStyle)}
      {...(editMode ? cmsEditAttrs('header', 'Cabeçalho', editSelectedId) : {})}
    >
      <div className="header__cluster">
        {data.modulesOrder.includes('logo') && data.logoEnabled ? (
          <span
            className={`header__home${editMode ? ` ${cmsEditClass(editSelectedId, 'logo')} cms-edit--nested` : ''}`}
            {...(editMode ? cmsEditAttrs('logo', 'Logo', editSelectedId) : {})}
          >
            {data.logoUrl ? (
              <img
                className="header__icon"
                src={data.logoUrl}
                alt=""
                draggable={false}
                style={
                  data.logoHeight > 0
                    ? { width: data.logoHeight, height: data.logoHeight }
                    : undefined
                }
              />
            ) : null}
          </span>
        ) : null}
        {data.modulesOrder.includes('logo') &&
        data.logoEnabled &&
        data.modulesOrder.includes('menu') &&
        data.menuEnabled ? (
          <span className="header__sep" aria-hidden="true" />
        ) : null}
        {data.modulesOrder.includes('menu') && data.menuEnabled ? (
          <span
            className={`header__menu${editMode ? ` ${cmsEditClass(editSelectedId, 'menu')} cms-edit--nested` : ''}`}
            {...(editMode ? cmsEditAttrs('menu', 'Menu', editSelectedId) : {})}
          >
            <span className="header__menu-label">
              <span
                className="header__menu-text"
                style={textStyleCss(
                  menuOpen ? data.menuCloseStyle : data.menuOpenStyle,
                )}
              >
                {menuLabel}
              </span>
            </span>
          </span>
        ) : null}
      </div>
      {data.modulesOrder.includes('cta') && data.ctaEnabled ? (
        <span
          className={`header__btn${editMode ? ` ${cmsEditClass(editSelectedId, 'cta')} cms-edit--nested` : ''}`}
          style={buttonStyleCss(data.ctaButtonStyle)}
          {...(editMode ? cmsEditAttrs('cta', 'CTA', editSelectedId) : {})}
        >
          <SiteIcon id={data.ctaIconId || 'external'} className="header__icon" />
          <span style={textStyleCss(data.ctaLabelStyle)}>{ctaLabel}</span>
        </span>
      ) : null}
    </header>
  )
}

export function HeaderMenuPreview({
  data,
  locale,
  editMode,
  editSelectedId,
}: {
  data: CmsHeaderPayload
  locale: Locale | string
} & EditProps) {
  const nav = data.modulesOrder.includes('nav')
    ? data.navItems.filter((item) => item.enabled)
    : []
  const socials = data.modulesOrder.includes('social')
    ? data.socials.filter((item) => item.enabled)
    : []
  const [hotId, setHotId] = useState<string | null>(nav[0]?.id ?? null)
  const [paused, setPaused] = useState(false)
  const listRef = useRef<HTMLUListElement>(null)
  const hot = nav.find((item) => item.id === hotId) ?? nav[0] ?? null
  const previewSrc = hot?.imageUrl || null

  return (
    <SiteStage>
      <div className="admin-site-stage__panel">
        <HeaderBarPreview
          data={data}
          locale={locale}
          menuOpen
          editMode={editMode}
          editSelectedId={editSelectedId}
        />
        <div
          className={`menu menu--open admin-site-stage__menu-live${editMode ? ` ${cmsEditClass(editSelectedId, 'nav')}` : ''}`}
          aria-hidden="false"
          {...(editMode ? cmsEditAttrs('nav', 'Links do menu', editSelectedId) : {})}
        >
          <nav className="menu__nav" aria-label="Primary">
            <ul
              ref={listRef}
              className={`menu__list${paused ? ' menu__list--paused' : ' menu__list--wave'}`}
            >
              {nav.map((item) => (
                <li key={item.id} className="menu__item">
                  <a
                    className={`menu__link${hotId === item.id ? ' menu__link--hot' : ''}${editMode ? ` ${cmsEditClass(editSelectedId, item.id)} cms-edit--nested` : ''}`}
                    href={item.path}
                    data-accent={item.accent ?? undefined}
                    {...(editMode
                      ? cmsEditAttrs(
                          item.id,
                          item.name.trim() || item.label.pt || 'Link',
                          editSelectedId,
                        )
                      : {})}
                    onClick={(event) => event.preventDefault()}
                    onPointerEnter={() => {
                      setHotId(item.id)
                      setPaused(true)
                    }}
                    onPointerLeave={() => setPaused(false)}
                  >
                    <span
                      className="menu__link-label"
                      style={{
                        ...(data.navGroupStyle.textColor
                          ? { color: data.navGroupStyle.textColor }
                          : {}),
                        ...textStyleCss(item.labelStyle),
                      }}
                    >
                      {item.label[locale] || item.name}
                      <span className="menu__link-dot" aria-hidden="true">
                        .
                      </span>
                    </span>
                    <span
                      className="menu__link-desc"
                      style={{
                        ...(data.navGroupStyle.textColor
                          ? { color: data.navGroupStyle.textColor }
                          : {}),
                        ...textStyleCss(item.descriptionStyle),
                      }}
                    >
                      <AccentedText
                        body={item.description[locale] || ''}
                        accents={item.accents[locale] || []}
                      />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="menu__preview" aria-hidden="true">
            {previewSrc ? (
              <div className="menu__preview-enter" key={previewSrc}>
                <div className="menu__preview-orbit">
                  <img
                    className="menu__preview-img"
                    src={previewSrc}
                    alt=""
                    draggable={false}
                  />
                </div>
              </div>
            ) : null}
          </div>
          <div className="menu__footer">
            {socials.map((item) => (
              <span
                key={item.id}
                className={`menu__social${editMode ? ` ${cmsEditClass(editSelectedId, item.id)} cms-edit--nested` : ''}`}
                {...(editMode
                  ? cmsEditAttrs(
                      item.id,
                      item.name.trim() || item.label || 'Rede',
                      editSelectedId,
                    )
                  : {})}
              >
                <span
                  className="menu__social-tip"
                  aria-hidden="true"
                  style={{
                    ...(data.socialGroupStyle.textColor
                      ? { color: data.socialGroupStyle.textColor }
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
                    data.socialGroupStyle.iconColor
                      ? { color: data.socialGroupStyle.iconColor }
                      : undefined
                  }
                />
              </span>
            ))}
            <span className="menu__footer-line" aria-hidden="true" />
          </div>
        </div>
      </div>
    </SiteStage>
  )
}

export function HeaderClosedPreview({
  data,
  locale,
  editMode,
  editSelectedId,
}: {
  data: CmsHeaderPayload
  locale: Locale | string
} & EditProps) {
  return (
    <SiteStage>
      <div className="admin-site-stage__panel admin-site-stage__panel--page">
        <HeaderBarPreview
          data={data}
          locale={locale}
          menuOpen={false}
          editMode={editMode}
          editSelectedId={editSelectedId}
        />
        <div className="admin-site-stage__ghost" aria-hidden="true">
          <span />
          <span />
        </div>
      </div>
    </SiteStage>
  )
}

export function CopyrightPreview({
  data,
  locale,
  editMode,
  editSelectedId,
}: {
  data: CmsFooterPayload
  locale: Locale | string
} & EditProps) {
  if (!data.enabled) return null

  const line1 =
    data.slots.includes('line1') && data.showLine1
      ? data.line1[locale] || data.line1.pt || ''
      : ''
  const line2 =
    data.slots.includes('line2') && data.showLine2
      ? data.line2[locale] || data.line2.pt || ''
      : ''

  if (!line1 && !line2) return null

  return (
    <aside
      className={`copyright${editMode ? ` ${cmsEditClass(editSelectedId, 'footer')}` : ''}`}
      aria-label="Copyright"
      {...(editMode ? cmsEditAttrs('footer', 'Footer', editSelectedId) : {})}
    >
      <div className="copyright__group">
        <span className="copyright__line" aria-hidden="true" />
        <p className="copyright__text">
          {line1 ? (
            <span
              style={textStyleCss(data.line1Style)}
              className={
                editMode
                  ? `${cmsEditClass(editSelectedId, 'footer::line1')} cms-edit--nested`
                  : undefined
              }
              {...(editMode
                ? cmsEditAttrs('footer::line1', 'Linha 1', editSelectedId)
                : {})}
            >
              {line1}
            </span>
          ) : null}
          {line2 ? (
            <span
              style={textStyleCss(data.line2Style)}
              className={
                editMode
                  ? `${cmsEditClass(editSelectedId, 'footer::line2')} cms-edit--nested`
                  : undefined
              }
              {...(editMode
                ? cmsEditAttrs('footer::line2', 'Linha 2', editSelectedId)
                : {})}
            >
              {line2}
            </span>
          ) : null}
        </p>
      </div>
    </aside>
  )
}

export function CornerToolsPreview({
  data,
  locale,
  highlight,
  editMode,
  editSelectedId,
}: {
  data: CmsChromePayload
  locale: Locale | string
  highlight?: string | null
} & EditProps) {
  const showBackToTop =
    data.blocksOrder.includes('backTop') && data.showBackToTop
  const showNews = data.blocksOrder.includes('news') && data.showNewsFab
  const showLanguage =
    data.blocksOrder.includes('language') && data.showLanguage
  const showTheme = data.blocksOrder.includes('theme') && data.showTheme
  const showSideTools = showLanguage || showTheme
  const langs = data.locales.filter((item) => item.enabled)

  if (!showBackToTop && !showNews && !showSideTools) return null

  return (
    <div className="corner-tools">
      {showBackToTop ? (
        <button
          type="button"
          className={`back-top${highlight === 'backTop' ? ' admin-site-stage__focus' : ''}${editMode ? ` ${cmsEditClass(editSelectedId, 'backTop')}` : ''}`}
          style={fabStyleCss(data.backToTop)}
          tabIndex={-1}
          aria-hidden="true"
          {...(editMode
            ? cmsEditAttrs('backTop', 'Voltar ao topo', editSelectedId)
            : {})}
        >
          <SiteIcon
            id={data.backToTop.iconId || 'arrow-up'}
            className="header__icon"
          />
        </button>
      ) : null}

      {showNews ? (
        <div
          className={`news-fab${highlight === 'news' ? ' admin-site-stage__focus' : ''}${editMode ? ` ${cmsEditClass(editSelectedId, 'news')}` : ''}`}
          {...(editMode ? cmsEditAttrs('news', 'Novidades', editSelectedId) : {})}
        >
          <button
            type="button"
            className="side-tools__fab"
            style={fabStyleCss(data.newsFab)}
            tabIndex={-1}
            aria-hidden="true"
          >
            <SiteIcon
              id={data.newsFab.iconId || 'news'}
              className="header__icon"
            />
          </button>
        </div>
      ) : null}

      {showSideTools ? (
        <aside
          className={`side-tools side-tools--open${
            highlight === 'language' || highlight === 'theme'
              ? ' admin-site-stage__focus'
              : ''
          }`}
          aria-hidden="true"
        >
          <div className="side-tools__stack">
            <div className="side-tools__panel">
              {showLanguage ? (
                <div
                  className={`side-tools__langs${editMode ? ` ${cmsEditClass(editSelectedId, 'language')}` : ''}`}
                  {...(editMode
                    ? cmsEditAttrs('language', 'Idioma', editSelectedId)
                    : {})}
                >
                  {langs.map((item) => (
                    <span
                      key={item.code}
                      className={`side-tools__lang${
                        item.code === locale ? ' side-tools__lang--active' : ''
                      }`}
                      style={textStyleCss(item.labelStyle)}
                      title={item.label}
                    >
                      <span className="side-tools__flag">
                        {data.languageMode === 'image' && item.imageUrl ? (
                          <img src={item.imageUrl} alt="" />
                        ) : (
                          item.flagEmoji || item.code.toUpperCase()
                        )}
                      </span>
                    </span>
                  ))}
                </div>
              ) : null}
              {showLanguage && showTheme ? (
                <span className="side-tools__divider" />
              ) : null}
              {showTheme ? (
                <div
                  className={`side-tools__theme${editMode ? ` ${cmsEditClass(editSelectedId, 'theme')}` : ''}`}
                  {...(editMode
                    ? cmsEditAttrs('theme', 'Tema', editSelectedId)
                    : {})}
                >
                  <label className="ui-switch">
                    <input type="checkbox" checked readOnly tabIndex={-1} />
                    <div className="slider">
                      <div className="circle">
                        <Moon weight="bold" />
                      </div>
                    </div>
                  </label>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="side-tools__fab"
              style={fabStyleCss(data.themeFab)}
              tabIndex={-1}
            >
              <SiteIcon
                id={data.themeFab.iconId || 'settings'}
                className="header__icon"
              />
            </button>
          </div>
        </aside>
      ) : null}
    </div>
  )
}

export function RainPreview({
  data,
  editMode,
  editSelectedId,
}: {
  data: CmsChromePayload
} & EditProps) {
  const showRain = data.blocksOrder.includes('rain') && data.rain.enabled
  if (!showRain) return null

  return (
    <div
      className={`admin-site-stage__rain${editMode ? ` ${cmsEditClass(editSelectedId, 'rain')}` : ''}`}
      {...(editMode
        ? cmsEditAttrs('rain', 'Chuva de código', editSelectedId)
        : {})}
    >
      <CodeRain config={data.rain} />
    </div>
  )
}

export function FooterSitePreview({
  data,
  locale,
  editMode,
  editSelectedId,
}: {
  data: CmsFooterPayload
  locale: Locale | string
} & EditProps) {
  if (!data.enabled) {
    return (
      <SiteStage>
        <div className="admin-site-stage__panel admin-site-stage__panel--page">
          <p className="admin-site-stage__hidden">Footer oculto</p>
        </div>
      </SiteStage>
    )
  }

  return (
    <SiteStage>
      <div className="admin-site-stage__panel admin-site-stage__panel--page">
        <div className="admin-site-stage__ghost" aria-hidden="true">
          <span />
          <span />
        </div>
        <CopyrightPreview
          data={data}
          locale={locale}
          editMode={editMode}
          editSelectedId={editSelectedId}
        />
      </div>
    </SiteStage>
  )
}

export function ChromeSitePreview({
  data,
  locale,
  highlight,
  editMode,
  editSelectedId,
}: {
  data: CmsChromePayload
  locale: Locale | string
  highlight?: string | null
} & EditProps) {
  return (
    <SiteStage>
      <div className="admin-site-stage__panel admin-site-stage__panel--page">
        <div className="admin-site-stage__ghost" aria-hidden="true">
          <span />
          <span />
        </div>
        <RainPreview
          data={data}
          editMode={editMode}
          editSelectedId={editSelectedId}
        />
        <CornerToolsPreview
          data={data}
          locale={locale}
          highlight={highlight}
          editMode={editMode}
          editSelectedId={editSelectedId}
        />
      </div>
    </SiteStage>
  )
}

/** Home completa: hero + cabeçalho + footer + configs (contexto global no preview). */
export function HomeSitePreview({
  heroData,
  headerData,
  footerData,
  chromeData,
  locale,
  previewDevice,
  editMode,
  editSelectedId,
}: {
  heroData: CmsHeroPayload
  headerData: CmsHeaderPayload
  footerData: CmsFooterPayload
  chromeData: CmsChromePayload
  locale: Locale | string
  previewDevice: PreviewDevice
  editMode?: boolean
  editSelectedId?: string | null
}) {
  return (
    <div className="admin-home-preview">
      {/* Stage cinza fixo (só visual + rain) — igual .stage do site */}
      <div className="admin-home-preview__stage" aria-hidden="true">
        <RainPreview data={chromeData} />
      </div>

      {/* Scroll estende até a borda direita: barra nativa fica no preto */}
      <div className="admin-home-preview__scroll">
        <HeroModulesView
          modules={heroData.modules}
          locale={locale}
          previewDevice={previewDevice}
          editMode={editMode}
          editSelectedId={editSelectedId}
        />
      </div>

      <HeaderBarPreview data={headerData} locale={locale} menuOpen={false} />
      <CopyrightPreview data={footerData} locale={locale} />
      <CornerToolsPreview data={chromeData} locale={locale} />
    </div>
  )
}
