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
}

export function Tab({ isActive, children }: ITabProps) {
  return (
    <Box
      style={{
        fontWeight: isActive ? "bold" : "",
        paddingBottom: "0.25rem",
      }}
    >
      {children}
    </Box>
  )
}
