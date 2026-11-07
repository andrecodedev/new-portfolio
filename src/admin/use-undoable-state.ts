import { useCallback, useState } from 'react'

type HistoryState<T> = {
  past: T[]
  present: T
  future: T[]
}

const MAX_HISTORY = 40

function sameValue<T>(a: T, b: T) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function useUndoableState<T>(initial: T | (() => T)) {
  const [history, setHistory] = useState<HistoryState<T>>(() => {
    const present =
      typeof initial === 'function' ? (initial as () => T)() : initial
    return {
      past: [],
      present,
      future: [],
    }
  })

  const reset = useCallback((value: T) => {
    setHistory({
      past: [],
      present: value,
      future: [],
    })
  }, [])

  const set = useCallback((next: T | ((current: T) => T)) => {
    setHistory((current) => {
      const value =
        typeof next === 'function'
          ? (next as (current: T) => T)(current.present)
          : next
      if (sameValue(current.present, value)) return current
      return {
        past: [...current.past, current.present].slice(-MAX_HISTORY),
        present: value,
        future: [],
      }
    })
  }, [])

  const undo = useCallback(() => {
    setHistory((current) => {
      if (current.past.length === 0) return current
      const previous = current.past[current.past.length - 1]
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future],
      }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory((current) => {
      if (current.future.length === 0) return current
      const [next, ...rest] = current.future
      return {
        past: [...current.past, current.present].slice(-MAX_HISTORY),
        present: next,
        future: rest,
      }
    })
  }, [])

  return {
    state: history.present,
    set,
    reset,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }
}
