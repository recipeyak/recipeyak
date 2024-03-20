import React from "react"

import { clx } from "@/classnames"

interface ITabsProps {
  readonly children: React.ReactElement<ITabProps>[]
}

export function Tabs({ children }: ITabsProps) {
  return <div className="flex gap-3">{children}</div>
}

interface ITabProps {
  readonly isActive?: boolean
  readonly children: React.ReactNode
  readonly onClick?: () => void
}

export function Tab({ isActive, children, onClick }: ITabProps) {
  return (
    <div
      className={clx(
        "flex pb-1 text-lg font-medium underline-offset-4",
        isActive && "underline",
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
