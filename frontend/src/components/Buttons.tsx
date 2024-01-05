import { LocationDescriptor } from "history"
import * as React from "react"
// eslint-disable-next-line no-restricted-imports
import { Button as AriaButton } from "react-aria-components"

import { clx } from "@/classnames"
import { Link } from "@/components/Routing"

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
}: {
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
}) => {
  const buttonCss = clx(
    "relative inline-flex cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-md border border-solid border-[var(--color-border)] bg-[var(--color-background-card)] p-0 px-3 py-1 text-center align-top text-sm font-medium leading-[1.5] text-[var(--color-text)] no-underline transition-[border-color,box-shadow] duration-200 focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-2 focus-visible:outline-[rgb(47,129,247)] enabled:hover:no-underline disabled:cursor-default disabled:text-[var(--color-text-disabled)] print:!hidden",
    variant === "link" &&
      "border-transparent bg-transparent text-[var(--color-text)] enabled:hover:text-[var(--color-text-disabled)] enabled:hover:underline enabled:focus:text-[var(--color-text-disabled)] enabled:focus:underline enabled:active:text-[var(--color-text-disabled)] enabled:active:underline",
    variant === "link" &&
      active &&
      "active:text-[var(--color-text-disabled)] active:underline",
    variant === "danger" &&
      "!border-[var(--color-danger)] bg-[var(--color-danger)] text-[var(--color-danger-button-text)] disabled:bg-[var(--color-danger-disabled)]",
    variant === "primary" &&
      "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-button-text)] focus:[box-shadow:0_0_5px_var(--color-primary-shadow)] enabled:hover:bg-[var(--color-primary-active)] enabled:active:!bg-[var(--color-primary-active)] disabled:bg-[var(--color-primary-disabled)]",
    variant === "primary" &&
      active &&
      "active:!bg-[var(--color-primary-active)]",
    loading &&
      "!text-[transparent] after:absolute after:left-[calc(50%-(1em/2))] after:top-[calc(50%-(1em/2))] after:block after:h-[1em] after:w-[1em] after:animate-spin after:rounded-[290486px] after:border-2 after:border-solid after:border-[var(--color-border)] after:border-r-transparent after:border-t-transparent after:duration-500 after:content-['']",
    size === "normal" && "text-base",
    size === "small" && "text-xs",
    // stylex would avoid us having to important this :/
    size === "large" && "!text-2xl",
  )
  if (to != null) {
    return (
      <Link {...props} to={to} className={clx(className, buttonCss)}>
        {children}
      </Link>
    )
  }

  return (
    <AriaButton
      {...props}
      isDisabled={loading || disabled}
      type={type}
      className={clx(className, buttonCss)}
    >
      {children}
    </AriaButton>
  )
}
