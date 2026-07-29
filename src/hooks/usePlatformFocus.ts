import { useCallback, useEffect, useState } from 'react'
import type { PlatformFocus, PlatformTaskType } from '@/types/platform'

const PLATFORM_FOCUS_KEY = 'self-red-team.platform-focus.v1'
const PLATFORM_FOCUS_EVENT = 'self-red-team-platform-focus'

function readFocus(): PlatformFocus | null {
  try {
    const raw = window.localStorage.getItem(PLATFORM_FOCUS_KEY)
    return raw ? JSON.parse(raw) as PlatformFocus : null
  } catch {
    return null
  }
}

export function usePlatformFocus() {
  const [focus, setFocusState] = useState<PlatformFocus | null>(readFocus)

  useEffect(() => {
    const handler = () => setFocusState(readFocus())
    window.addEventListener(PLATFORM_FOCUS_EVENT, handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener(PLATFORM_FOCUS_EVENT, handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  const setFocus = useCallback((next: PlatformFocus | null) => {
    setFocusState(next)
    if (next) window.localStorage.setItem(PLATFORM_FOCUS_KEY, JSON.stringify(next))
    else window.localStorage.removeItem(PLATFORM_FOCUS_KEY)
    window.dispatchEvent(new CustomEvent(PLATFORM_FOCUS_EVENT))
  }, [])

  const focusTask = useCallback((id: string, type: PlatformTaskType) => setFocus({ id, type }), [setFocus])

  return { focus, setFocus, focusTask }
}
