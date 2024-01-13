import { LocationDescriptor } from "history"
import * as React from "react"
// eslint-disable-next-line no-restricted-imports
import { Button as AriaButton } from "react-aria-components"

import { clx } from "@/classnames"
import { Link } from "@/components/Routing"

export const Button = ({
  loading,
  className,
  size = "normal",
  children,
  active,
  variant,
  disabled,
  hover,
  focus,
  to,
  type,
  ...props
}: {
  readonly size?: "small" | "normal" | "large"

  readonly style?: React.CSSProperties
  readonly className?: string
  readonly children: React.ReactNode
  readonly variant?: "primary" | "danger" | "gradient"
  readonly type?: "submit" | "reset" | "button" | undefined
  readonly loading?: boolean
  readonly active?: boolean
  readonly hover?: boolean
  readonly focus?: boolean
  readonly disabled?: boolean
  readonly onClick?: () => void
  readonly to?: string | LocationDescriptor<unknown>
}) => {
  const variantStyles = clx(
    variant === undefined &&
      "border-[var(--color-normal-default-border)] bg-[var(--color-normal-default-bg)] text-[var(--color-normal-default-text)] enabled:hover:border-[var(--color-normal-hover-border)] enabled:hover:bg-[var(--color-normal-hover-bg)] enabled:hover:text-[var(--color-normal-hover-text)] enabled:active:border-[var(--color-normal-active-border)] enabled:active:bg-[var(--color-normal-active-bg)] enabled:active:text-[var(--color-normal-active-text)] disabled:border-[var(--color-normal-disabled-border)] disabled:bg-[var(--color-normal-disabled-bg)] disabled:text-[var(--color-normal-disabled-text)] enabled:data-[force-active='true']:border-[var(--color-normal-active-border)] enabled:data-[force-hover='true']:border-[var(--color-normal-hover-border)] enabled:data-[force-active='true']:bg-[var(--color-normal-active-bg)] enabled:data-[force-hover='true']:bg-[var(--color-normal-hover-bg)] enabled:data-[force-active='true']:text-[var(--color-normal-active-text)] enabled:data-[force-hover='true']:text-[var(--color-normal-hover-text)]",
    variant === "primary" &&
      "border-[var(--color-primary-default-border)] bg-[var(--color-primary-default-bg)] text-[var(--color-primary-default-text)] enabled:hover:border-[var(--color-primary-hover-border)] enabled:hover:bg-[var(--color-primary-hover-bg)] enabled:hover:text-[var(--color-primary-hover-text)] enabled:active:border-[var(--color-primary-active-border)] enabled:active:bg-[var(--color-primary-active-bg)] enabled:active:text-[var(--color-primary-active-text)] disabled:border-[var(--color-primary-disabled-border)] disabled:bg-[var(--color-primary-disabled-bg)] disabled:text-[var(--color-primary-disabled-text)] enabled:data-[force-active='true']:border-[var(--color-primary-active-border)] enabled:data-[force-hover='true']:border-[var(--color-primary-hover-border)] enabled:data-[force-active='true']:bg-[var(--color-primary-active-bg)] enabled:data-[force-hover='true']:bg-[var(--color-primary-hover-bg)] enabled:data-[force-active='true']:text-[var(--color-primary-active-text)] enabled:data-[force-hover='true']:text-[var(--color-primary-hover-text)]",
    variant === "danger" &&
      "border-[var(--color-danger-default-border)] bg-[var(--color-danger-default-bg)] text-[var(--color-danger-default-text)] enabled:hover:border-[var(--color-danger-hover-border)] enabled:hover:bg-[var(--color-danger-hover-bg)] enabled:hover:text-[var(--color-danger-hover-text)] enabled:active:border-[var(--color-danger-active-border)] enabled:active:bg-[var(--color-danger-active-bg)] enabled:active:text-[var(--color-danger-active-text)] disabled:border-[var(--color-danger-disabled-border)] disabled:bg-[var(--color-danger-disabled-bg)] disabled:text-[var(--color-danger-disabled-text)] enabled:data-[force-active='true']:border-[var(--color-danger-active-border)] enabled:data-[force-hover='true']:border-[var(--color-danger-hover-border)] enabled:data-[force-active='true']:bg-[var(--color-danger-active-bg)] enabled:data-[force-hover='true']:bg-[var(--color-danger-hover-bg)] enabled:data-[force-active='true']:text-[var(--color-danger-active-text)] enabled:data-[force-hover='true']:text-[var(--color-danger-hover-text)]",
    variant === "gradient" &&
      "pointer-events-auto !border-none text-white !shadow-none backdrop-blur-[10px] ![background-color:rgba(0,0,0,0.46)]",
  )

  const focusCss = clx(
    "focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-2 focus-visible:outline-[rgb(47,129,247)]",
    focus &&
      "!outline !outline-[3px] !-outline-offset-2 !outline-[rgb(47,129,247)]",
  )

  const textSize = clx(
    size === "normal" && "text-base",
    size === "small" && "text-xs",
    size === "large" && "!text-2xl",
  )

  const buttonCss = clx(
    "relative inline-flex cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-md border border-solid p-0 px-3 py-1 text-center align-top text-sm font-medium leading-[1.5] no-underline transition-[border-color,background-color] duration-75 disabled:cursor-default print:!hidden",
    focusCss,
    variantStyles,
    textSize,
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
      style={props.style}
      onPress={props.onClick}
      isDisabled={loading || disabled}
      type={type ?? "button"}
      className={clx(className, buttonCss)}
      data-force-hover={hover}
      data-force-active={active}
    >
      {children}
    </AriaButton>
  )
}
