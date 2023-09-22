import React from "react"

import { Box } from "@/components/Box"

interface ITabsProps {
  readonly children: React.ReactElement<ITabProps>[]
}

export function Tabs({ children }: ITabsProps) {
  return <Box gap={3}>{children}</Box>
}

interface ITabProps {
  readonly isActive?: boolean
  readonly children: React.ReactNode
  readonly onClick?: () => void
}

export function Tab({ isActive, children, onClick }: ITabProps) {
  return (
    <Box
      style={{
        textDecoration: isActive ? "underline" : "",
        textUnderlineOffset: "0.25rem",
        paddingBottom: "0.25rem",
        fontWeight: "500",
        fontSize: "18px",
      }}
      onClick={onClick}
    >
      {children}
    </Box>
  )
}
