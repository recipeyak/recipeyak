import React from "react"
import GlobalEvent from "@/components/GlobalEvent"

interface IDropdownProps {
  /**
   * Displays children
   */
  show: boolean
  /**
   * Handler called when click occurs outside of trigger and children.
   * Also called when `ESC` is pressed.
   */
  onClose: () => void
  /**
   * The component used to trigger the dropdown
   */
  // tslint:disable-next-line:no-any
  trigger: React.ReactElement<any>
  /**
   * The components to render upon show.
   */
  children: React.ReactNode
}

/**
 * Manage a simple Dropdown
 *
 * Calls onClose when `ESC` is pressed or click occurs outside of tree.
 */
export default class Dropdown extends React.Component<IDropdownProps> {
  /**
   * Reference that allows us to see that we are click inside our tree
   */
  element = React.createRef<HTMLDivElement>()
  handleGlobalClick = (e: MouseEvent) => {
    // Do nothing if we are hidden
    if (!this.props.show) {
      return
    }
    const el = this.element.current
    // Close when we click outside of our dropdown/button group
    if (el && e.target && !el.contains(e.target as Node)) {
      this.props.onClose()
    }
  }
  handleGlobalKeyUp = (e: KeyboardEvent) => {
    // Do nothing if we are hidden
    if (!this.props.show) {
      return
    }
    if (e.key === "Escape") {
      this.props.onClose()
    }
  }
  render() {
    return (
      <div className="p-rel" ref={this.element}>
        <GlobalEvent
          mouseUp={this.handleGlobalClick}
          keyUp={this.handleGlobalKeyUp}
        />
        {this.props.trigger}
        {this.props.children}
      </div>
    )
  }
}
