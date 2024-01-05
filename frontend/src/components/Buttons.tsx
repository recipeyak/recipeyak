import { LocationDescriptor } from "history"
import * as React from "react"

import { clx } from "@/classnames"
import { Link } from "@/components/Routing"

interface IButtonProps {
  readonly loading?: boolean
  readonly size?: "small" | "normal" | "large"
  readonly active?: boolean
  readonly style?: React.CSSProperties
  readonly className?: string
  readonly children: React.ReactNode
  readonly variant?: "primary" | "danger" | "link"
  readonly type?: "submit" | "reset" | "button" | undefined
  readonly disabled?: boolean
  readonly onClick?: (e: React.MouseEvent) => void
  readonly to?: string | LocationDescriptor<unknown>
}
export const Button = ({
  loading = false,
  className = "",
  size = "normal",
  children,
  active,
  variant,
  disabled,
  to,
  type = "button",
  ...props
}: IButtonProps) => {
  const buttonCss = clx(
    "relative inline-flex cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-md border border-solid border-[var(--color-border)] bg-[var(--color-background-card)] px-[0.75em] py-[calc(0.375em-1px)] text-center align-top text-base font-medium leading-[1.5] text-[var(--color-text)] no-underline transition-[translateY,border-color,box-shadow] duration-200 enabled:hover:no-underline enabled:active:translate-y-px disabled:cursor-default disabled:text-[var(--color-text-disabled)]",
    active && "translate-y-px",
    variant === "link" &&
      "border-transparent bg-transparent text-[var(--color-text)] enabled:hover:text-[var(--color-text-disabled)] enabled:hover:underline enabled:focus:text-[var(--color-text-disabled)] enabled:focus:underline enabled:active:text-[var(--color-text-disabled)] enabled:active:underline",
    variant === "danger" &&
      "!border-[var(--color-danger)] bg-[var(--color-danger)] text-[var(--color-danger-button-text)] disabled:bg-[var(--color-danger-disabled)]",
    variant === "primary" &&
      "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-button-text)] focus:[box-shadow:0_0_5px_var(--color-primary-shadow)] enabled:hover:bg-[var(--color-primary-active)] enabled:active:!bg-[var(--color-primary-active)] disabled:bg-[var(--color-primary-disabled)]",
    loading &&
      "!text-[transparent] after:absolute after:left-[calc(50%-(1em/2))] after:top-[calc(50%-(1em/2))] after:block after:h-[1em] after:w-[1em] after:animate-spin after:rounded-[290486px] after:border-2 after:border-solid after:border-[var(--color-border)] after:border-r-transparent after:border-t-transparent after:duration-500 after:content-['']",
    size === "small" && "text-xs",
    size === "large" && "text-2xl",
  )
  if (to != null) {
    return (
      <Link {...props} to={to} className={clx(className, buttonCss)}>
        {children}
      </Link>
    )
  }

  return (
    <button
      {...props}
      disabled={loading || disabled}
      type={type}
      className={clx(className, buttonCss)}
    >
      {children}
    </button>
  )
}
