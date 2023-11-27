import { useEffect } from "react"

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
  useEffect(() => {
    if (keyUp) {
      document.addEventListener("keyup", keyUp)
    }
    return () => {
      if (keyUp) {
        document.removeEventListener("keyup", keyUp)
      }
    }
  }, [keyUp])
  useEffect(() => {
    if (keyDown) {
      document.addEventListener("keydown", keyDown)
    }
    return () => {
      if (keyDown) {
        document.removeEventListener("keydown", keyDown)
      }
    }
  }, [keyDown])
  useEffect(() => {
    if (mouseUp) {
      document.addEventListener("mouseup", mouseUp)
    }
    return () => {
      if (mouseUp) {
        document.removeEventListener("mouseup", mouseUp)
      }
    }
  }, [mouseUp])
  useEffect(() => {
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
