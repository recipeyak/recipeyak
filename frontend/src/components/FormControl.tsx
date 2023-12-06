import { clx } from "@/classnames"

export function FormControl({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={clx("relative text-left text-base", className)}
      children={children}
    />
  )
}
