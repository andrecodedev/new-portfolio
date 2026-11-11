import { useReducedMotion } from 'framer-motion'
import { AccentedText } from '../components/accented-text'
import { SkeletonImage } from '../components/skeleton-image'
import { ASSETS } from '../data/site'
import { useLocale } from '../i18n/LocaleProvider'
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
import { buttonStyleCss, textStyleCss } from './style-tokens'
import { cmsEditAttrs, cmsEditClass } from './cms-edit'

export type PreviewDevice = 'desktop' | 'mobile'

type HeroModulesViewProps = {
  modules: HeroModule[]
  locale: string
  animated?: boolean
  previewDevice?: PreviewDevice
  onNavigate?: (path: string) => void
  /** Admin: habilita outline + clique para editar */
  editMode?: boolean
  editSelectedId?: string | null
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
  editMode,
  editSelectedId,
}: {
  module: IntroModule
  locale: string
  animated: boolean
  editMode?: boolean
  editSelectedId?: string | null
}) {
  const { t } = useLocale()
  const copy = module.copy[locale] ?? module.copy.pt
  const accents = t.home.heroSubtitleAccents
  const { visible, textStyles, slots } = module
  const has = (slot: (typeof slots)[number]) => slots.includes(slot)
  const showTitle1 = has('title1') && visible.titleLine1
  const showTitle2 = has('title2') && visible.titleLine2
  const showSub1 = has('sub1') && visible.subtitleLine1
  const showSub2 = has('sub2') && visible.subtitleLine2
  const showTitle = showTitle1 || showTitle2
  const showSubtitle = showSub1 || showSub2
  const avatarSrc = module.gallery[0] || ASSETS.avatar
  const photoId = `${module.id}::photo`
  const media = has('photo') && module.showAvatar ? (
    <div
      className={`hero__media${editMode ? ` ${cmsEditClass(editSelectedId, photoId)} cms-edit--nested` : ''}`}
      {...(editMode ? cmsEditAttrs(photoId, 'Foto', editSelectedId) : {})}
    >
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
    editMode ? cmsEditClass(editSelectedId, module.id) : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      className={className}
      aria-label="Introduction"
      {...(editMode ? cmsEditAttrs(module.id, 'Avatar', editSelectedId) : {})}
    >
      <div className="hero__content">
        <div className="hero__copy">
          {showTitle ? (
            <h1 className="hero__title">
              {showTitle1 ? (
                <span
                  className={`hero__title-line${editMode ? ` ${cmsEditClass(editSelectedId, `${module.id}::title1`)} cms-edit--nested` : ''}`}
                  style={textStyleCss(textStyles.titleLine1)}
                  {...(editMode
                    ? cmsEditAttrs(`${module.id}::title1`, 'Título', editSelectedId)
                    : {})}
                >
                  <span className="hero__title-text">{copy.titleLine1}</span>
                </span>
              ) : null}
              {showTitle2 ? (
                <span
                  className={`hero__title-line${editMode ? ` ${cmsEditClass(editSelectedId, `${module.id}::title2`)} cms-edit--nested` : ''}`}
                  style={textStyleCss(textStyles.titleLine2)}
                  {...(editMode
                    ? cmsEditAttrs(`${module.id}::title2`, 'Título', editSelectedId)
                    : {})}
                >
                  <span className="hero__title-text">{copy.titleLine2}</span>
                </span>
              ) : null}
            </h1>
          ) : null}
          {showSubtitle ? (
            <p className="hero__subtitle">
              {showSub1 ? (
                <span
                  className={`hero__subtitle-line${editMode ? ` ${cmsEditClass(editSelectedId, `${module.id}::sub1`)} cms-edit--nested` : ''}`}
                  style={textStyleCss(textStyles.subtitleLine1)}
                  {...(editMode
                    ? cmsEditAttrs(`${module.id}::sub1`, 'Subtítulo', editSelectedId)
                    : {})}
                >
                  <AccentedText body={copy.subtitleLine1} accents={accents} />
                </span>
              ) : null}
              {showSub2 ? (
                <span
                  className={`hero__subtitle-line${editMode ? ` ${cmsEditClass(editSelectedId, `${module.id}::sub2`)} cms-edit--nested` : ''}`}
                  style={textStyleCss(textStyles.subtitleLine2)}
                  {...(editMode
                    ? cmsEditAttrs(`${module.id}::sub2`, 'Subtítulo', editSelectedId)
                    : {})}
                >
                  <AccentedText body={copy.subtitleLine2} accents={accents} />
                </span>
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
  editMode,
  editSelectedId,
}: {
  module: LineModule
  locale: string
  animated: boolean
  reduce: boolean
  previewDevice?: PreviewDevice
  onNavigate?: (path: string) => void
  editMode?: boolean
  editSelectedId?: string | null
}) {
  const activeAlign =
    previewDevice === 'mobile' ? module.alignMobile : module.alignDesktop
  const side = sideFromAlign(activeAlign)
  const title = module.title[locale]
  const body = module.body[locale]
  const accents = module.accents[locale].map((word) => word.trim()).filter(Boolean)
  const slots = module.slots
  const has = (slot: (typeof slots)[number]) => slots.includes(slot)
  const buttons =
    has('buttons') && module.visible.cta
      ? (module.buttons ?? []).filter(
          (button) => button.label[locale].trim().length > 0,
        )
      : []
  const shown = module.visible
  const className = lineClass(module)
  const imageSrc =
    has('image') && shown.image ? module.gallery[0] : undefined
  const figure = imageSrc ? (
    <div className="hero-line__media">
      <SkeletonImage className="hero-line__img" src={imageSrc} alt="" />
    </div>
  ) : null
  const { textStyles } = module
  const useAccents = has('accents')
  const titleLines = [
    has('title1') && shown.titleLine1 ? title[0] : '',
    has('title2') && shown.titleLine2 ? title[1] : '',
  ].filter((line) => line.length > 0)
  const showTitle = titleLines.length > 0
  const showBody = has('body') && shown.body
  const accentWords = useAccents ? accents : []

  return (
    <section
      className={`works${editMode ? ` ${cmsEditClass(editSelectedId, module.id)}` : ''}`}
      data-accent={module.accent}
      aria-label={title[0]}
      {...(editMode ? cmsEditAttrs(module.id, 'Linha', editSelectedId) : {})}
    >
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
                    accents={accentWords}
                    withMark={false}
                  />
                  <RevealRule className="works__rule" from={side} side={side} />
                </div>
              ) : null}
              {showBody ? (
                <RevealCopy
                  className="works__text"
                  side={side}
                  style={textStyleCss(textStyles.body)}
                >
                  <AccentedText body={body} accents={accentWords} />
                </RevealCopy>
              ) : null}
              {buttons.length > 0 ? (
                <div className="hero-line__btns">
                  {buttons.map((button) => (
                    <RevealButton
                      key={button.id}
                      className="works__btn"
                      side={side}
                      style={{
                        ...buttonStyleCss(button.style),
                        ...textStyleCss(button.labelStyle),
                      }}
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
                        style={textStyleCss(
                          index === 0
                            ? textStyles.titleLine1
                            : textStyles.titleLine2,
                        )}
                      >
                        <span className="reveal-title__text">
                          <AccentedText body={line} accents={accentWords} />
                        </span>
                      </span>
                    ))}
                  </h2>
                  <span className="works__rule" aria-hidden="true" />
                </div>
              ) : null}
              {showBody ? (
                <p className="works__text" style={textStyleCss(textStyles.body)}>
                  <AccentedText body={body} accents={accentWords} />
                </p>
              ) : null}
              {buttons.length > 0 ? (
                <div className="hero-line__btns">
                  {buttons.map((button) => (
                    <button
                      key={button.id}
                      type="button"
                      className="works__btn"
                      style={{
                        ...buttonStyleCss(button.style),
                        ...textStyleCss(button.labelStyle),
                      }}
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
  editMode,
  editSelectedId,
}: {
  module: ScrollModule
  locale: string
  editMode?: boolean
  editSelectedId?: string | null
}) {
  const showLabel =
    module.slots.includes('label') && module.visible.label
  const showLine = module.visible.line
  if (!showLabel && !showLine) return null

  const text = (module.label[locale] ?? module.label.pt ?? 'SCROLL').trim() || 'SCROLL'
  const letters = Array.from(text)
  const accent = module.accent === 'ink' ? undefined : module.accent

  return (
    <section
      className={`scroll scroll--d-${module.alignDesktop} scroll--m-${module.alignMobile}${editMode ? ` ${cmsEditClass(editSelectedId, module.id)}` : ''}`}
      aria-hidden="true"
      data-accent={accent}
      {...(editMode ? cmsEditAttrs(module.id, 'Scroll', editSelectedId) : {})}
    >
      <div className="scroll__inner">
        {showLabel ? (
          <span
            className="scroll__label"
            style={textStyleCss(module.labelStyle)}
          >
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
        ) : null}
        {showLine ? <span className="scroll__line" /> : null}
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
  editMode,
  editSelectedId,
}: HeroModulesViewProps) {
  const reduce = Boolean(useReducedMotion())

  return (
    <div className="hero-modules hero-stack" data-preview-device={previewDevice}>
      {modules
        .filter((module) => module.enabled || editMode)
        .map((module) =>
          module.kind === 'intro' ? (
            <IntroView
              key={module.id}
              module={module}
              locale={locale}
              animated={animated}
              editMode={editMode}
              editSelectedId={editSelectedId}
            />
          ) : module.kind === 'scroll' ? (
            <ScrollView
              key={module.id}
              module={module}
              locale={locale}
              editMode={editMode}
              editSelectedId={editSelectedId}
            />
          ) : (
            <LineView
              key={module.id}
              module={module}
              locale={locale}
              animated={animated}
              reduce={reduce}
              previewDevice={previewDevice}
              onNavigate={onNavigate}
              editMode={editMode}
              editSelectedId={editSelectedId}
            />
          ),
        )}
    </div>
  )
}
