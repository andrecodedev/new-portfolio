import type { CSSProperties } from 'react'

export type StyleSize = 'sm' | 'md' | 'lg'

export type TextStyle = {
  size: StyleSize
  color: string
}

export type ButtonStyle = {
  size: StyleSize
  textSize: StyleSize
  color: string
  background: string
  borderColor: string
}

export const STYLE_SIZES: StyleSize[] = ['sm', 'md', 'lg']

/** Escala relativa ao tamanho do CSS do site. md = 1 (não mexe no design). */
const TEXT_SCALE: Record<StyleSize, number> = {
  sm: 0.85,
  md: 1,
  lg: 1.2,
}

const BUTTON_PAD_MAP: Record<StyleSize, string | undefined> = {
  sm: '0.45em 0.85em',
  md: undefined,
  lg: '0.85em 1.4em',
}

export function defaultTextStyle(color = ''): TextStyle {
  return { size: 'md', color }
}

export function defaultButtonStyle(): ButtonStyle {
  return {
    size: 'md',
    textSize: 'md',
    color: '',
    background: '',
    borderColor: '',
  }
}

export function parseTextStyle(value: unknown, fallback = defaultTextStyle()): TextStyle {
  if (!value || typeof value !== 'object') return fallback
  const row = value as Partial<TextStyle>
  const size =
    row.size === 'sm' || row.size === 'md' || row.size === 'lg' ? row.size : fallback.size
  return {
    size,
    color: typeof row.color === 'string' ? row.color : fallback.color,
  }
}

export function parseButtonStyle(
  value: unknown,
  fallback = defaultButtonStyle(),
): ButtonStyle {
  if (!value || typeof value !== 'object') return fallback
  const row = value as Partial<ButtonStyle>
  const size =
    row.size === 'sm' || row.size === 'md' || row.size === 'lg' ? row.size : fallback.size
  const textSize =
    row.textSize === 'sm' || row.textSize === 'md' || row.textSize === 'lg'
      ? row.textSize
      : fallback.textSize
  return {
    size,
    textSize,
    color: typeof row.color === 'string' ? row.color : fallback.color,
    background: typeof row.background === 'string' ? row.background : fallback.background,
    borderColor:
      typeof row.borderColor === 'string' ? row.borderColor : fallback.borderColor,
  }
}

/**
 * Estilo de texto do CMS.
 * md / cor vazia = não sobrescreve o CSS do site (design original).
 * sm/lg só seta --cms-text-scale; as classes do site multiplicam o tamanho base.
 */
export function textStyleCss(style: TextStyle): CSSProperties {
  const css: CSSProperties & Record<string, string | number> = {
    // Sempre seta pra o preview reagir ao trocar sm/md/lg
    '--cms-text-scale': String(TEXT_SCALE[style.size]),
  }
  if (style.color) css.color = style.color
  return css
}

/**
 * Estilo de botão do CMS.
 * md = não mexe em padding/fonte (fica o do site).
 */
export function buttonStyleCss(style: ButtonStyle): CSSProperties {
  const css: CSSProperties & Record<string, string | number> = {}
  const pad = BUTTON_PAD_MAP[style.size]
  if (pad) css.padding = pad
  if (style.textSize !== 'md') {
    css['--cms-text-scale'] = String(TEXT_SCALE[style.textSize])
  }
  if (style.color) css.color = style.color
  if (style.background) css.background = style.background
  if (style.borderColor) css.borderColor = style.borderColor
  return css
}
