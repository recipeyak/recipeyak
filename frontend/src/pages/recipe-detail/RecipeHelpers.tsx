import React from "react"

export function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <h2 className={`mb-0 text-2xl font-bold ${className}`}>{children}</h2>
}
