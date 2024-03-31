import React from "react"

import { clx } from "@/classnames"

export function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <h2 className={clx("text-2xl font-bold", className)}>{children}</h2>
}
