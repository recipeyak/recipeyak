import { clx } from "@/classnames"

export function Tag({
  children,
  fontWeight,
  selectable,
}: {
  children: React.ReactNode
  fontWeight?: "normal"
  selectable?: boolean
}) {
  return (
    <span
      className={clx(
        "inline-flex h-[2em] items-center justify-center whitespace-nowrap rounded-[290486px] bg-[--color-background-card] px-[0.875em] text-xs leading-[1.5] text-[--color-text]",
        fontWeight && "font-normal",
        selectable && "!cursor-auto !select-text",
      )}
    >
      {children}
    </span>
  )
}
