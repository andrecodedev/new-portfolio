import { useEffect, useMemo, useState } from 'react'
import {
  DESIGN_FONT_OPTIONS,
  type DesignFontId,
} from '../cms/design-content'
import { useCmsDesign } from '../cms/cms-provider'
import { useLocale } from '../i18n/LocaleProvider'
import FuzzyText from './fuzzy-text'

type NotFoundPageProps = {
  onGoHome: () => void
}

/** Mesmo cálculo do FuzzyText: padX = fuzzRange + 20, inset = 5 */
const FUZZ_RANGE = 22
const FUZZ_LEFT_INSET = FUZZ_RANGE + 20 + 5

function stackFor(id: DesignFontId) {
  return (
    DESIGN_FONT_OPTIONS.find((item) => item.id === id)?.stack ??
    DESIGN_FONT_OPTIONS[0].stack
  )
}

function primaryFamily(stack: string) {
  return stack.split(',')[0]?.replace(/['"]/g, '').trim() || 'Space Grotesk'
}

export default function NotFoundPage({ onGoHome }: NotFoundPageProps) {
  const { t } = useLocale()
  const design = useCmsDesign()
  const copy = t.notFound
  const [fontsReady, setFontsReady] = useState(false)

  // Título do site (Space Grotesk) — Manrope fica genérica demais nessa 404.
  const titleFont = useMemo(
    () => stackFor(design.typography.titleFont),
    [design.typography.titleFont],
  )
  const uiFont = useMemo(
    () => stackFor(design.typography.uiFont),
    [design.typography.uiFont],
  )

  useEffect(() => {
    let cancelled = false
    const ready = async () => {
      try {
        await document.fonts.load(`600 48px "${primaryFamily(titleFont)}"`)
        await document.fonts.ready
      } catch {
        // segue mesmo se a API de fontes falhar
      }
      if (!cancelled) setFontsReady(true)
    }
    void ready()
    return () => {
      cancelled = true
    }
  }, [titleFont])

  return (
    <section
      className="not-found"
      aria-labelledby="not-found-title"
      style={{ fontFamily: titleFont }}
    >
      <div className="not-found__inner">
        <p className="not-found__code" style={{ fontFamily: uiFont }} aria-hidden="true">
          {copy.code}
        </p>

        <h1
          id="not-found-title"
          className="not-found__title"
          style={{ fontFamily: titleFont }}
        >
          {fontsReady ? (
            <span
              className="not-found__fuzzy"
              aria-hidden="true"
              style={{ marginLeft: -FUZZ_LEFT_INSET }}
            >
              {copy.titleLines.map((line) => (
                <FuzzyText
                  key={line}
                  fontSize="clamp(1.85rem, 1.2rem + 2.4vw, 3rem)"
                  fontWeight={600}
                  fontFamily={titleFont}
                  color="currentColor"
                  baseIntensity={0.16}
                  hoverIntensity={0.42}
                  fuzzRange={FUZZ_RANGE}
                  trigger="hover"
                  direction="horizontal"
                  sliceSize={1}
                  fps={60}
                  intro
                  introDuration={1200}
                  enableHover
                  colorSplit={0}
                  letterSpacing={-0.5}
                >
                  {line}
                </FuzzyText>
              ))}
            </span>
          ) : (
            <span className="not-found__title-fallback" aria-hidden="true">
              {copy.titleLines.map((line) => (
                <span key={line} className="not-found__title-line">
                  {line}
                </span>
              ))}
            </span>
          )}
          <span className="sr-only">{copy.title}</span>
        </h1>

        <p className="not-found__body" style={{ fontFamily: titleFont }}>
          {copy.body}
        </p>

        <button
          className="spot__btn not-found__cta"
          type="button"
          onClick={onGoHome}
        >
          {copy.cta}
        </button>
      </div>
    </section>
  )
}
