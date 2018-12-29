import React from "react"

interface IGlobalEventProps {
  mouseUp?: (e: MouseEvent) => void
  mouseDown?: (e: MouseEvent) => void
  keyDown?: (e: KeyboardEvent) => void
  keyUp?: (e: KeyboardEvent) => void
}

/** Mixin of sorts for registering global event handlers
 *
 * Note that we do _not_ support changing props after mount
 */
export default class GlobalEvent extends React.Component<IGlobalEventProps> {
  componentDidMount() {
    if (this.props.mouseUp) {
      document.addEventListener("mouseup", this.props.mouseUp)
    }
    if (this.props.mouseDown) {
      document.addEventListener("mousedown", this.props.mouseDown)
    }
    if (this.props.keyDown) {
      document.addEventListener("keydown", this.props.keyDown)
    }
    if (this.props.keyUp) {
      document.addEventListener("keyup", this.props.keyUp)
    }
  }

  componentWillUnmount() {
    if (this.props.mouseUp) {
      document.removeEventListener("mouseup", this.props.mouseUp)
    }
    if (this.props.mouseDown) {
      document.removeEventListener("mousedown", this.props.mouseDown)
    }
    if (this.props.keyDown) {
      document.removeEventListener("keydown", this.props.keyDown)
    }
    if (this.props.keyUp) {
      document.removeEventListener("keyup", this.props.keyUp)
    }
  }
  render() {
    return null
  }
}
