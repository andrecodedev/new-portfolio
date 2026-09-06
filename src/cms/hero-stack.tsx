import { useReducedMotion } from 'framer-motion'
import { AccentedText } from '../components/accented-text'
import { SkeletonImage } from '../components/skeleton-image'
import { ASSETS } from '../data/site'
import type { Locale } from '../i18n/copy'
import {
  MaskTitle,
  RevealButton,
  RevealCopy,
  RevealRule,
} from '../motion/scroll-reveal'
import {
  openHeroLink,
  type Align,
  type HeroModule,
  type IntroModule,
  type LineModule,
  type ScrollModule,
} from './hero-content'

export type PreviewDevice = 'desktop' | 'mobile'

type HeroModulesViewProps = {
  modules: HeroModule[]
  locale: Locale
  animated?: boolean
  previewDevice?: PreviewDevice
  onNavigate?: (path: string) => void
}

function sideFromAlign(align: Align): 'left' | 'right' {
  return align === 'end' ? 'right' : 'left'
}

function lineClass(module: LineModule) {
  const imageDesktop = module.imageDesktop ?? 'end'
  const imageMobile = module.imageMobile ?? 'after'
  return [
    'hero-block',
    `hero-block--d-${module.alignDesktop}`,
    `hero-block--m-${module.alignMobile}`,
    `hero-line--d-img-${imageDesktop}`,
    `hero-line--m-img-${imageMobile}`,
  ].join(' ')
}

function IntroView({
  module,
  locale,
}: {
  module: IntroModule
  locale: Locale
  animated: boolean
}) {
  const copy = module.copy[locale]
  const { visible } = module
  const showTitle = visible.titleLine1 || visible.titleLine2
  const showSubtitle = visible.subtitleLine1 || visible.subtitleLine2
  const avatarSrc = module.gallery[0] || ASSETS.avatar
  const media = module.showAvatar ? (
    <div className="hero__media">
      <div className="hero__avatar">
        <SkeletonImage
          className="hero__avatar-img"
          src={avatarSrc}
          alt="André Vitor"
        />
      </div>
    </div>
  ) : null

  const className = [
    'hero',
    'hero--cms',
    `hero--d-text-${module.desktopTextSide}`,
    `hero--m-avatar-${module.mobileAvatar}`,
    `hero--m-align-${module.mobileAlign}`,
  ].join(' ')

  return (
    <section className={className} aria-label="Introduction">
      <div className="hero__content">
        <div className="hero__copy">
          {showTitle ? (
            <h1 className="hero__title">
              {visible.titleLine1 ? (
                <span className="hero__title-line">
                  <span className="hero__title-text">{copy.titleLine1}</span>
                </span>
              ) : null}
              {visible.titleLine2 ? (
                <span className="hero__title-line">
                  <span className="hero__title-text">{copy.titleLine2}</span>
                </span>
              ) : null}
            </h1>
          ) : null}
          {showSubtitle ? (
            <p className="hero__subtitle">
              {visible.subtitleLine1 ? (
                <span className="hero__subtitle-line">{copy.subtitleLine1}</span>
              ) : null}
              {visible.subtitleLine2 ? (
                <span className="hero__subtitle-line">{copy.subtitleLine2}</span>
              ) : null}
            </p>
          ) : null}
        </div>
        {media}
      </div>
    </section>
  )
}

function LineView({
  module,
  locale,
  animated,
  reduce,
  previewDevice,
  onNavigate,
}: {
  module: LineModule
  locale: Locale
  animated: boolean
  reduce: boolean
  previewDevice?: PreviewDevice
  onNavigate?: (path: string) => void
}) {
  const activeAlign =
    previewDevice === 'mobile' ? module.alignMobile : module.alignDesktop
  const side = sideFromAlign(activeAlign)
  const title = module.title[locale]
  const body = module.body[locale]
  const accents = module.accents[locale].map((word) => word.trim()).filter(Boolean)
  const buttons = module.visible.cta
    ? (module.buttons ?? []).filter((button) => button.label[locale].trim().length > 0)
    : []
  const shown = module.visible
  const className = lineClass(module)
  const imageSrc = shown.image ? module.gallery[0] : undefined
  const figure = imageSrc ? (
    <div className="hero-line__media">
      <SkeletonImage className="hero-line__img" src={imageSrc} alt="" />
    </div>
  ) : null
  const titleLines = [
    shown.titleLine1 ? title[0] : '',
    shown.titleLine2 ? title[1] : '',
  ].filter((line) => line.length > 0)
  const showTitle = titleLines.length > 0

  return (
    <section className="works" data-accent={module.accent} aria-label={title[0]}>
      <div className={`${className} hero-line`}>
        <div className="hero-line__copy">
          {animated ? (
            <>
              {showTitle ? (
                <div className="hero-block__heading">
                  <MaskTitle
                    className="works__title"
                    lines={titleLines}
                    reduce={reduce}
                    side={side}
                    accents={accents}
                    withMark={false}
                  />
                  <RevealRule className="works__rule" from={side} side={side} />
                </div>
              ) : null}
              {shown.body ? (
                <RevealCopy className="works__text" side={side}>
                  <AccentedText body={body} accents={accents} />
                </RevealCopy>
              ) : null}
              {buttons.length > 0 ? (
                <div className="hero-line__btns">
                  {buttons.map((button) => (
                    <RevealButton
                      key={button.id}
                      className="works__btn"
                      side={side}
                      onClick={() => openHeroLink(button.to, onNavigate)}
                    >
                      {button.label[locale]}
                    </RevealButton>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <>
              {showTitle ? (
                <div className="hero-block__heading">
                  <h2 className="works__title">
                    {titleLines.map((line, index) => (
                      <span
                        key={`${module.id}-${index}`}
                        className="reveal-title__line"
                      >
                        <span className="reveal-title__text">
                          <AccentedText body={line} accents={accents} />
                        </span>
                      </span>
                    ))}
                  </h2>
                  <span className="works__rule" aria-hidden="true" />
                </div>
              ) : null}
              {shown.body ? (
                <p className="works__text">
                  <AccentedText body={body} accents={accents} />
                </p>
              ) : null}
              {buttons.length > 0 ? (
                <div className="hero-line__btns">
                  {buttons.map((button) => (
                    <button
                      key={button.id}
                      type="button"
                      className="works__btn"
                      onClick={() => openHeroLink(button.to, onNavigate)}
                    >
                      {button.label[locale]}
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
        {figure}
      </div>
    </section>
  )
}

function ScrollView({
  module,
  locale,
}: {
  module: ScrollModule
  locale: Locale
}) {
  const text = module.label[locale].trim() || 'SCROLL'
  const letters = Array.from(text)
  const accent = module.accent === 'ink' ? undefined : module.accent

  return (
    <section
      className={`scroll scroll--d-${module.alignDesktop} scroll--m-${module.alignMobile}`}
      aria-hidden="true"
      data-accent={accent}
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
    </section>
  )
}

export function HeroModulesView({
  modules,
  locale,
  animated = false,
  previewDevice,
  onNavigate,
}: HeroModulesViewProps) {
  const reduce = Boolean(useReducedMotion())

  return (
    <div className="hero-modules hero-stack" data-preview-device={previewDevice}>
      {modules
        .filter((module) => module.enabled)
        .map((module) =>
          module.kind === 'intro' ? (
            <IntroView
              key={module.id}
              module={module}
              locale={locale}
              animated={animated}
            />
          ) : module.kind === 'scroll' ? (
            <ScrollView key={module.id} module={module} locale={locale} />
          ) : (
            <LineView
              key={module.id}
              module={module}
              locale={locale}
              animated={animated}
              reduce={reduce}
              previewDevice={previewDevice}
              onNavigate={onNavigate}
            />
          ),
        )}
    </div>
  )
}
