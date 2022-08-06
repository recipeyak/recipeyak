import { isSameDay } from "date-fns"
import { isRight } from "fp-ts/lib/Either"
import { debounce } from "lodash-es"
import React from "react"
import {
  TypedUseSelectorHook,
  useDispatch as useDispatchRedux,
  useSelector as useSelectorRedux,
} from "react-redux"

import { second } from "@/date"
import { HttpRequestObjResult } from "@/http"
import { scheduleURLFromTeamID } from "@/store/mapState"
import { IState } from "@/store/store"
import { Dispatch } from "@/store/thunks"
import { Failure, Loading, Success, WebData } from "@/webdata"

export function useCurrentDay() {
  const [date, setDate] = React.useState(new Date())

  React.useEffect(() => {
    const timerID = setInterval(() => {
      const newDate = new Date()
      if (!isSameDay(date, newDate)) {
        setDate(newDate)
      }
    }, 5 * second)
    return () => {
      clearInterval(timerID)
    }
  }, [date])

  return date
}

interface IGlobalEventProps {
  readonly mouseUp?: (e: MouseEvent) => void
  readonly mouseDown?: (e: MouseEvent) => void
  readonly keyDown?: (e: KeyboardEvent) => void
  readonly keyUp?: (e: KeyboardEvent) => void
}

export function useGlobalEvent({
  mouseUp,
  mouseDown,
  keyDown,
  keyUp,
}: IGlobalEventProps) {
  React.useEffect(() => {
    if (keyUp) {
      document.addEventListener("keyup", keyUp)
    }
    return () => {
      if (keyUp) {
        document.removeEventListener("keyup", keyUp)
      }
    }
  }, [keyUp])
  React.useEffect(() => {
    if (keyDown) {
      document.addEventListener("keydown", keyDown)
    }
    return () => {
      if (keyDown) {
        document.removeEventListener("keydown", keyDown)
      }
    }
  }, [keyDown])
  React.useEffect(() => {
    if (mouseUp) {
      document.addEventListener("mouseup", mouseUp)
    }
    return () => {
      if (mouseUp) {
        document.removeEventListener("mouseup", mouseUp)
      }
    }
  }, [mouseUp])
  React.useEffect(() => {
    if (mouseDown) {
      document.addEventListener("mousedown", mouseDown)
    }
    return () => {
      if (mouseDown) {
        document.removeEventListener("mousedown", mouseDown)
      }
    }
  }, [mouseDown])
}

// Type useDispatch for our actions
export const useDispatch = () => useDispatchRedux<Dispatch>()
// Type useSelector for our root state
export const useSelector: TypedUseSelectorHook<IState> = useSelectorRedux

export function useOnClickOutside<T extends HTMLElement>(
  handler: (e: MouseEvent | TouchEvent) => void,
): React.MutableRefObject<T | null> {
  const ref = React.useRef<T | null>(null)

  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current
      if (
        el == null ||
        (event.target instanceof HTMLElement && el.contains(event.target))
      ) {
        return
      }

      handler(event)
    }

    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)

    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, handler])
  return ref
}

export function useOnWindowFocusChange(cb: () => void) {
  React.useEffect(() => {
    // Sometimes Safari triggers multiple focus events for window focus change
    // instead of 1. We avoid this by debouncing.
    // webkit bug: https://bugs.webkit.org/show_bug.cgi?id=179990
    const handleEvent = debounce(cb, 400, {
      leading: true,
      trailing: false,
    })
    window.addEventListener("focus", handleEvent)
    return () => {
      window.removeEventListener("focus", handleEvent)
    }
  }, [cb])
}

export function useScheduleTeamID() {
  return useSelector((s) => s.user.scheduleTeamID) || "personal"
}

export const useScheduleURL = () => useSelector(scheduleURLFromTeamID)

// global, module level cache.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const USE_STATE_CACHE: Record<string, any> = new Map()

function useStateCached<T>(key: string): [T | undefined, (x: T) => void] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const [localState, setLocalState] = React.useState<T>(USE_STATE_CACHE[key])
  const setState = React.useCallback(
    (newState: T) => {
      setLocalState(newState)
      USE_STATE_CACHE[key] = newState
    },
    [key, setLocalState],
  )

  return [localState, setState]
}

export function useApi<A, O, T>(
  request: HttpRequestObjResult<A, O, T>,
): WebData<A> {
  const [data, setData] = useStateCached<WebData<A>>(request.getCacheKey())
  React.useEffect(() => {
    if (data == null) {
      setData(Loading())
    }
    void request.send().then((res) => {
      if (isRight(res)) {
        setData(Success(res.right))
        return
      }
      setData(Failure())
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.getCacheKey()])
  return data
}
