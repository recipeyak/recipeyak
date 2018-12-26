import * as React from "react"

import { classNames } from "@/classnames"

interface IDayProps {
  readonly endDate: boolean
  readonly highlight: boolean
  readonly inPast: boolean
  readonly date: Date
  readonly handleClick: (date: Date) => void
}

class Day extends React.Component<IDayProps> {
  render() {
    return (
      <div
        className={classNames(
          "w-100",
          "h-100",
          "text-center",
          "align-self-center",
          "white-space-nowrap",
          "justify-self-center",
          "p-1",
          "cal-day",
          { "bg-primary": this.props.endDate },
          { "bg-primary-shadow": this.props.highlight && !this.props.endDate },
          { "color-white": this.props.highlight || this.props.endDate },
          { "cal-in-past": this.props.inPast },
          this.props.inPast ? "cursor-default" : "cursor-pointer",
          { "text-muted": this.props.inPast }
        )}
        onClick={() => this.props.handleClick(this.props.date)}>
        {this.props.date.getDate()}
      </div>
    )
  }
}

export default Day
