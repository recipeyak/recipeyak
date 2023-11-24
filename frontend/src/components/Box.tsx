import React from "react"

import cls from "@/classnames"

export function Box({
  dir = "row",
  children,
  space,
  m,
  mb,
  mx,
  mt,
  gap,
  w,
  align,
  shrink,
  grow,
  wrap,
  lineHeight,
  style,
  className,
  onClick,
}: {
  dir?: "col" | "row"
  className?: string
  children: React.ReactNode
  space?: "between" | "end"
  m?: 0 | 1 | 2 | 3 | 4
  mb?: 0 | 1 | 2 | 3 | 4
  mt?: 0 | 1 | 2 | 3 | 4
  mx?: "auto"
  w?: 100
  gap?: 0 | 1 | 2 | 3 | 4
  align?: "center" | "start" | "end"
  shrink?: 0
  grow?: 1
  wrap?: true
  lineHeight?: "tight"
  style?: React.CSSProperties
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cls(
        "d-flex",
        dir === "col" && "flex-column",
        dir === "row" && "flex-row",
        m === 0 && "m-0",
        m === 1 && "m-1",
        m === 2 && "m-2",
        m === 3 && "m-3",
        m === 4 && "m-4",
        mb === 0 && "mb-0",
        mb === 1 && "mb-1",
        mb === 2 && "mb-2",
        mb === 3 && "mb-3",
        mb === 4 && "mb-4",
        mt === 0 && "mt-0",
        mt === 1 && "mt-1",
        mt === 2 && "mt-2",
        mt === 3 && "mt-3",
        mt === 4 && "mt-4",
        mx === "auto" && "mx-auto",
        gap === 0 && "gap-0",
        gap === 1 && "gap-1",
        gap === 2 && "gap-2",
        gap === 3 && "gap-3",
        gap === 4 && "gap-4",
        space === "between" && "flex-space-between",
        space === "end" && "justify-end",
        align === "center" && "align-items-center",
        align === "start" && "align-items-start",
        align === "end" && "align-items-end",
        w === 100 && "w-100",
        shrink === 0 && "flex-shrink-0",
        grow === 1 && "flex-grow-1",
        wrap && "flex-wrap",
        lineHeight === "tight" && "line-height-tight",
        className,
      )}
      children={children}
      style={style}
    />
  )
}
