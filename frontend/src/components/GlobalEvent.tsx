import { useEffect } from "react"

interface IGlobalEventProps {
  readonly mouseUp?: (e: MouseEvent) => void
  readonly mouseDown?: (e: MouseEvent) => void
  readonly keyDown?: (e: KeyboardEvent) => void
  readonly keyUp?: (e: KeyboardEvent) => void
}

/** Mixin of sorts for registering global event handlers
 *
 * Note that we do _not_ support changing props after mount
 */
export default function GlobalEvent(props: IGlobalEventProps) {
  useEffect(() => {
    if (props.mouseUp) {
      document.addEventListener("mouseup", props.mouseUp)
    }
    if (props.mouseDown) {
      document.addEventListener("mousedown", props.mouseDown)
    }
    if (props.keyDown) {
      document.addEventListener("keydown", props.keyDown)
    }
    if (props.keyUp) {
      document.addEventListener("keyup", props.keyUp)
    }

    return () => {
      if (props.mouseUp) {
        document.removeEventListener("mouseup", props.mouseUp)
      }
      if (props.mouseDown) {
        document.removeEventListener("mousedown", props.mouseDown)
      }
      if (props.keyDown) {
        document.removeEventListener("keydown", props.keyDown)
      }
      if (props.keyUp) {
        document.removeEventListener("keyup", props.keyUp)
      }
    }
  }, [props.keyDown, props.keyUp, props.mouseDown, props.mouseUp])

  return null
}
