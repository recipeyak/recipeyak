import React from "react"

export function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <h2 className={`font-bold text-2xl mb-0 ${className}`}>{children}</h2>
}
