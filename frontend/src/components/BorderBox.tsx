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
}: {
  p?: 3 | 2
  h?: 100
  display?: "flex"
  flexDirection?: "column"
  minHeight?: "74px"
  children: React.ReactNode
  whenSmallRounded0?: boolean
  className?: string
}) {
  return (
    <div
      className={clx(
        "bg-[var(--color-background)] text-[var(--color-text)]",
        p == null
          ? "p-[1.2rem]"
          : p === 2
            ? "p-2"
            : p === 3
              ? "p-3"
              : undefined,
        minHeight != null ? "min-h-[74px]" : undefined,
        whenSmallRounded0 ? "rounded-0 sm:rounded-[6px]" : "rounded-[6px]",
        display && "flex",
        flexDirection && "flex-col",
        h && "h-full",
        className,
      )}
    >
      {children}
    </div>
  )
}
