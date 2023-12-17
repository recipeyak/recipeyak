import { clx } from "@/classnames"

export function FormField({
  children,
  isGrouped,
  className,
}: {
  children: React.ReactNode
  isGrouped?: boolean
  className?: string
}) {
  return (
    <div
      className={clx(isGrouped && "justify-start gap-2", className)}
      children={children}
    />
  )
}
