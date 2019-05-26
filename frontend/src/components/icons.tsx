import React from "react"

export function DragIcon() {
  const size = 18
  return (
    <svg
      className="flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#4a4a4a"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="8" cy="5" r="1" />
      <circle cx="8" cy="12" r="1" />
      <circle cx="8" cy="19" r="1" />

      <circle cx="16" cy="5" r="1" />
      <circle cx="16" cy="12" r="1" />
      <circle cx="16" cy="19" r="1" />
    </svg>
  )
}
