import { clx } from "@/classnames"

export function BorderBox({
  p,
  display,
  h,
  flexDirection,
  children,
  minHeight,
  whenSmallRounded0,
  className,
  ...rest
}: {
  p?: 3 | 2
  h?: 100
  display?: "flex"
  flexDirection?: "column"
  minHeight?: "74px"
  children: React.ReactNode
  whenSmallRounded0?: boolean
  className?: string
} & (
  | {
      as?: undefined
    }
  | {
      as: "form"
      onSubmit: (_: React.FormEvent) => void
    }
)) {
  const cls = clx(
    "bg-[var(--color-background)] text-[var(--color-text)]",
    p == null ? "p-[1.2rem]" : p === 2 ? "p-2" : p === 3 ? "p-3" : undefined,
    minHeight != null ? "min-h-[74px]" : undefined,
    whenSmallRounded0 ? "rounded-0 sm:rounded-[6px]" : "rounded-[6px]",
    display && "flex",
    flexDirection && "flex-col",
    h && "h-full",
    className,
  )
  if (rest.as === "form") {
    return <form className={cls} onSubmit={rest.onSubmit} />
  }
  return <div className={cls}>{children}</div>
}
