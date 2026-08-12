import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import {
  motion,
  useReducedMotion,
  type Variants,
} from 'framer-motion'
import { easeOutExpo, easeOutSoft, useEntrance } from './reveal'

export type ScrollRootRef = RefObject<HTMLElement | null>

export const ScrollRootContext = createContext<ScrollRootRef | null>(null)

export function useScrollViewport() {
  const root = useContext(ScrollRootContext)

  return useMemo(
    () => ({
      once: false,
      /* Meio-termo: original (0.28 + margem negativa) pedia scroll demais;
         0.1 + margem positiva grande animava fora da vista. */
      amount: 0.2,
      margin: '0px 0px -4% 0px' as const,
      ...(root ? { root } : {}),
    }),
    [root],
  )
}

/** @deprecated Use useScrollViewport() — root precisa do .stage__scroll */
export const scrollViewport = {
  once: false,
  amount: 0.2,
  margin: '0px 0px -4% 0px',
} as const

export type BodySlide = 'up' | 'left' | 'right' | 'soft'
export type ButtonPunch = 'lift' | 'slide' | 'pop'
export type RuleGrow = 'left' | 'right'

export type ScrollRecipe = {
  body: BodySlide
  button: ButtonPunch
  rule: RuleGrow
}

/** Receitas por seção: mesma família, gestos diferentes. */
export const SCROLL_RECIPES: Record<string, ScrollRecipe> = {
  work: { body: 'up', button: 'lift', rule: 'left' },
  about: { body: 'right', button: 'slide', rule: 'right' },
  reading: { body: 'soft', button: 'pop', rule: 'left' },
  contact: { body: 'left', button: 'lift', rule: 'right' },
}

/**
 * canAnimate: liberado só depois do loader sumir.
 * playId: sobe quando o gate abre, força replay limpo (nada “já animou” atrás do loader).
 */
export function useScrollReveal() {
  const { show: bootReady, ready } = useEntrance()
  const reduce = Boolean(useReducedMotion())
  const canAnimate = reduce || bootReady
  const [playId, setPlayId] = useState(0)
  const wasReady = useRef(false)

  useLayoutEffect(() => {
    if (ready && !wasReady.current) {
      setPlayId((current) => current + 1)
    }
    wasReady.current = ready
  }, [ready])

  return { canAnimate, reduce, playId }
}

/** Saída mais rápida que a entrada: reseta sem “enrolar” no scroll. */
const exitQuick = { duration: 0.28, ease: easeOutExpo } as const

export const sectionStagger: Variants = {
  hidden: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
      when: 'afterChildren',
    },
  },
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0,
    },
  },
}

const bodyHidden: Record<BodySlide, { opacity: number; x?: number; y?: number }> =
  {
    up: { opacity: 0, y: 22 },
    left: { opacity: 0, x: -28 },
    right: { opacity: 0, x: 28 },
    soft: { opacity: 0, y: 12 },
  }

export function bodyVariants(kind: BodySlide): Variants {
  return {
    hidden: {
      ...bodyHidden[kind],
      transition: exitQuick,
    },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: kind === 'soft' ? 0.85 : 0.65,
        ease: kind === 'soft' ? easeOutSoft : easeOutExpo,
      },
    },
  }
}

export function ruleVariants(_from: RuleGrow): Variants {
  return {
    hidden: { scaleX: 0, transition: exitQuick },
    show: {
      scaleX: 1,
      transition: { duration: 0.7, ease: easeOutExpo },
    },
  }
}

export function buttonVariants(kind: ButtonPunch): Variants {
  if (kind === 'slide') {
    return {
      hidden: { opacity: 0, x: 24, transition: exitQuick },
      show: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.55, ease: easeOutExpo },
      },
    }
  }

  if (kind === 'pop') {
    return {
      hidden: { opacity: 0, scale: 0.88, transition: exitQuick },
      show: {
        opacity: 1,
        scale: 1,
        transition: {
          type: 'spring',
          stiffness: 360,
          damping: 22,
          mass: 0.7,
        },
      },
    }
  }

  return {
    hidden: { opacity: 0, y: 18, transition: exitQuick },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 280,
        damping: 22,
        mass: 0.8,
      },
    },
  }
}

type MaskTitleProps = {
  className?: string
  lines: string[]
  /** Marca (ponto) na última linha */
  withMark?: boolean
  reduce?: boolean
}

/** Título com máscara: texto sobe linha a linha (efeito “escrita limpa”). */
export function MaskTitle({
  className = '',
  lines,
  withMark = true,
  reduce = false,
}: MaskTitleProps) {
  return (
    <h2 className={className}>
      {lines.map((line, index) => {
        const isLast = index === lines.length - 1
        return (
          /* key estável por índice: troca de idioma atualiza o texto sem remount
             (remount deixava y:110% preso atrás do overflow). */
          <span key={index} className="reveal-title__line">
            <motion.span
              className="reveal-title__text"
              variants={
                reduce
                  ? { hidden: { y: 0 }, show: { y: 0 } }
                  : {
                      hidden: {
                        y: '110%',
                        transition: { duration: 0.28, ease: easeOutExpo },
                      },
                      show: {
                        y: 0,
                        transition: {
                          duration: 0.8,
                          delay: index * 0.08,
                          ease: easeOutExpo,
                        },
                      },
                    }
              }
            >
              {line}
              {withMark && isLast ? (
                <span className="accent-mark">.</span>
              ) : null}
            </motion.span>
          </span>
        )
      })}
    </h2>
  )
}

type RevealRuleProps = {
  className?: string
  from: RuleGrow
}

export function RevealRule({ className = '', from }: RevealRuleProps) {
  const reduce = Boolean(useReducedMotion())

  return (
    <motion.span
      className={className}
      aria-hidden="true"
      variants={
        reduce
          ? { hidden: { scaleX: 1 }, show: { scaleX: 1 } }
          : ruleVariants(from)
      }
      style={{
        transformOrigin: from === 'right' ? 'right center' : 'left center',
      }}
    />
  )
}

type RevealCopyProps = {
  className?: string
  kind: BodySlide
  children: ReactNode
}

export function RevealCopy({ className = '', kind, children }: RevealCopyProps) {
  const reduce = Boolean(useReducedMotion())

  return (
    <motion.p
      className={className}
      variants={
        reduce
          ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
          : bodyVariants(kind)
      }
    >
      {children}
    </motion.p>
  )
}

type RevealButtonProps = {
  className?: string
  kind: ButtonPunch
  onClick: () => void
  children: ReactNode
}

export function RevealButton({
  className = '',
  kind,
  onClick,
  children,
}: RevealButtonProps) {
  const reduce = Boolean(useReducedMotion())

  return (
    <motion.button
      type="button"
      className={className}
      onClick={onClick}
      variants={
        reduce
          ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
          : buttonVariants(kind)
      }
    >
      {children}
    </motion.button>
  )
}
