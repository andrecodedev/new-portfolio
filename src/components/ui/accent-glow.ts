/**
 * Brilho da cor de destaque numa pasta cinza: um gradiente diagonal que nasce de um canto e se
 * dissipa no cinza. Ângulo, canto e alcance variam por pasta, mas são determinísticos (mesma
 * semente, mesmo resultado), senão a pasta mudaria de desenho a cada render.
 */
export type AccentGlow = {
  /** Ângulo no formato do CSS (0deg aponta para cima, sentido horário). */
  angle: number
  /** Até onde o brilho chega ao longo do gradiente, de 0 a 1. */
  reach: number
  /** Opacidade da cor de destaque no ponto de origem, de 0 a 1. */
  alpha: number
}

const hash = (text: string) => {
  let h = 2166136261
  for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return h >>> 0
}

// Diagonais que partem de cada canto: sup. esquerdo, sup. direito, inf. esquerdo, inf. direito.
const CORNER_ANGLES = [135, 225, 45, 315]

export function accentGlow(seed: string): AccentGlow {
  const h = hash(seed)
  const jitter = ((h >>> 3) % 31) - 15
  return {
    angle: CORNER_ANGLES[h % 4] + jitter,
    reach: (62 + ((h >>> 8) % 28)) / 100,
    alpha: (62 + ((h >>> 13) % 12)) / 100,
  }
}

/**
 * Gradiente linear do canvas equivalente ao `linear-gradient(<angle>, ...)` do CSS para uma
 * caixa: a linha do gradiente passa pelo centro e tem o comprimento que toca os cantos.
 */
export function cssLinearGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  angleDeg: number,
  reach = 1,
) {
  const a = (angleDeg * Math.PI) / 180
  const dx = Math.sin(a)
  const dy = -Math.cos(a)
  const length = Math.abs(w * dx) + Math.abs(h * dy)
  const cx = x + w / 2
  const cy = y + h / 2
  const x0 = cx - (dx * length) / 2
  const y0 = cy - (dy * length) / 2
  return ctx.createLinearGradient(x0, y0, x0 + dx * length * reach, y0 + dy * length * reach)
}
