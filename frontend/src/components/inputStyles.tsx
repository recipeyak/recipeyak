import { clx } from "@/classnames"

export const inputStyles = (props: { error?: boolean; className?: string }) =>
  clx(
    "relative z-[1] w-full appearance-none items-center justify-start rounded-md border border-solid border-[--color-border] bg-[--color-background-card] px-2 py-[5px] align-top text-base text-[--color-text] shadow-none transition-[border-color,box-shadow] duration-200 [box-shadow:inset_0_1px_2px_rgba(10,10,10,0.1)] placeholder:text-[--color-input-placeholder]",
    props.error && "border-[--color-danger]",
    props.className,
  )
