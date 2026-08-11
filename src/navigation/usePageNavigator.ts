import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLoaderBgForPath } from '../data/site'
import { lockPageScroll, unlockPageScroll } from './scroll-lock'

const TRANSITION_HOLD_MS = 900
const TRANSITION_EXIT_MS = 700

type TransitionState = {
  active: boolean
  exiting: boolean
  background: string
}

const INITIAL: TransitionState = {
  active: false,
  exiting: false,
  background: 'var(--bg-loader)',
}

export function usePageNavigator() {
  const navigate = useNavigate()
  const [transition, setTransition] = useState<TransitionState>(INITIAL)
  const lockedRef = useRef(false)

  const goTo = useCallback(
    (path: string) => {
      const target = path.startsWith('/') ? path : `/${path}`
      if (lockedRef.current) return
      if (window.location.pathname === target) {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
        return
      }

      lockedRef.current = true
      const background = getLoaderBgForPath(target)
      setTransition({ active: true, exiting: false, background })
      lockPageScroll()

      window.setTimeout(() => {
        navigate(target)
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
        setTransition({ active: true, exiting: true, background })
      }, TRANSITION_HOLD_MS)
    },
    [navigate],
  )

  const finishTransition = useCallback(() => {
    setTransition(INITIAL)
    unlockPageScroll()
    lockedRef.current = false
  }, [])

  return {
    transition,
    goTo,
    finishTransition,
    transitionExitMs: TRANSITION_EXIT_MS,
  }
}
