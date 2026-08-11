import {
  createContext,
  useContext,
  type ReactNode,
} from 'react'
import { useReducedMotion, type Transition, type Variants } from 'framer-motion'

const RevealContext = createContext(false)
const MenuOpenContext = createContext(false)

type RevealProviderProps = {
  ready: boolean
  children: ReactNode
}

export function RevealProvider({ ready, children }: RevealProviderProps) {
  return (
    <RevealContext.Provider value={ready}>{children}</RevealContext.Provider>
  )
}

type MenuOpenProviderProps = {
  open: boolean
  children: ReactNode
}

export function MenuOpenProvider({ open, children }: MenuOpenProviderProps) {
  return (
    <MenuOpenContext.Provider value={open}>{children}</MenuOpenContext.Provider>
  )
}

export function useRevealReady() {
  return useContext(RevealContext)
}

export function useMenuOpen() {
  return useContext(MenuOpenContext)
}

/** Ease “cara de premium”: acelera e freia sem bounce. */
export const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1]
export const easeOutSoft: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function useEntrance() {
  const ready = useRevealReady()
  const reduce = useReducedMotion()
  const show = Boolean(reduce || ready)

  return { ready, reduce: Boolean(reduce), show }
}

export const headerStagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0,
    },
  },
}

export const headerFromTop: Variants = {
  hidden: { opacity: 0, y: -16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOutExpo },
  },
}

export const headerFromRight: Variants = {
  hidden: { opacity: 0, x: 18 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
}

export const fabEntrance: Variants = {
  hidden: { opacity: 0, scale: 0.55, y: 24 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 360,
      damping: 26,
      mass: 0.8,
      delay: 0.12,
    },
  },
}

/** MENU: listas e rodapé social a cada abertura. */
export const menuRoot: Variants = {
  hidden: {
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
      when: 'afterChildren',
    },
  },
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.28,
    },
  },
}

export const menuItem: Variants = {
  hidden: {
    opacity: 0,
    y: 22,
    transition: { duration: 0.22, ease: easeOutExpo },
  },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOutExpo },
  },
}

export const menuLabel: Variants = {
  hidden: {
    opacity: 0,
    x: -18,
    transition: { duration: 0.2, ease: easeOutExpo },
  },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
}

export const menuDesc: Variants = {
  hidden: {
    opacity: 0,
    x: 14,
    transition: { duration: 0.2, ease: easeOutExpo },
  },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, delay: 0.05, ease: easeOutSoft },
  },
}

export const menuFooter: Variants = {
  hidden: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.55,
    },
  },
}

export const menuSocial: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.85,
    transition: { duration: 0.2, ease: easeOutExpo },
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 340,
      damping: 22,
      mass: 0.7,
    },
  },
}

export const menuFooterLine: Variants = {
  hidden: {
    scaleX: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: easeOutExpo },
  },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.45, ease: easeOutExpo },
  },
}

export const titleMaskTransition = (delay: number): Transition => ({
  duration: 0.85,
  delay,
  ease: easeOutExpo,
})

export const bodyEntranceTransition = (delay: number): Transition => ({
  duration: 0.7,
  delay,
  ease: easeOutSoft,
})

export const mediaEntranceTransition = (delay: number): Transition => ({
  duration: 0.95,
  delay,
  ease: easeOutExpo,
})

export const metaEntranceTransition = (delay: number): Transition => ({
  duration: 0.65,
  delay,
  ease: easeOutSoft,
})
