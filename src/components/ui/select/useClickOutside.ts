import { type RefObject, useEffect } from 'react'

interface Options {
  extraRef?: RefObject<HTMLElement | null>
  enabled?: boolean
}

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
  { extraRef, enabled = true }: Options = {},
) {
  useEffect(() => {
    if (!enabled) return

    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target

      if (!(target instanceof Node)) return

      if (ref.current?.contains(target)) return
      if (extraRef?.current?.contains(target)) return

      handler()
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [enabled, handler, ref, extraRef])
}
