import React from "react"

interface ITabsProps {
  readonly children: React.ReactElement<ITabProps>[]
  readonly small?: boolean
  readonly className?: string
}

export function Tabs({ children, small = false, className = "" }: ITabsProps) {
  const cls = !small ? "is-normal" : ""
  return (
    <div className={`tabs is-boxed ${cls} ${className}`}>
      <ul>{children}</ul>
    </div>
  )
}

interface ITabProps {
  readonly isActive: boolean
  readonly children: React.ReactNode
}

export function Tab({ isActive, children }: ITabProps) {
  const cls = isActive ? "is-active" : ""
  return <li className={cls}>{children}</li>
}
