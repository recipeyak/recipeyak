import * as React from "react"

import { assertNever } from "@/assert"
import { classNames } from "@/classnames"
import { Link } from "@/components/Routing"

interface IButtonProps {
  readonly loading?: boolean
  readonly size?: "small" | "normal"
  readonly active?: boolean
  readonly style?: React.CSSProperties
  readonly className?: string
  readonly children: React.ReactNode
  readonly variant?: "primary" | "danger" | "secondary" | "link"
  readonly type?: "submit" | "reset" | "button" | undefined
  readonly name?: string | undefined
  readonly disabled?: boolean
  readonly value?: string | ReadonlyArray<string> | number | undefined
  readonly onClick?: (e: React.MouseEvent) => void
  readonly to?: string
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
  const buttonSize =
    size === "small"
      ? "is-small"
      : size === "normal"
      ? "is-normal"
      : assertNever(size)

  if (to != null) {
    return (
      <Link
        {...props}
        to={to}
        className={classNames("my-button", "br-6", className, buttonSize, {
          "is-primary": variant === "primary",
          "is-danger": variant === "danger",
          "is-secondary": variant === "secondary",
          "is-link": variant === "link",
          "is-loading": loading,
          "is-active": active,
        })}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      {...props}
      disabled={loading || disabled}
      type={type}
      className={classNames("my-button", "br-6", className, buttonSize, {
        "is-primary": variant === "primary",
        "is-danger": variant === "danger",
        "is-secondary": variant === "secondary",
        "is-link": variant === "link",
        "is-loading": loading,
        "is-active": active,
      })}
    >
      {children}
    </button>
  )
}
