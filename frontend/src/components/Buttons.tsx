import * as React from "react"

import { assertNever } from "@/assert"
import { classNames } from "@/classnames"

interface IButtonProps {
  readonly loading?: boolean
  readonly size?: "small" | "normal"
  readonly active?: boolean
  readonly className?: string
  readonly children: React.ReactNode
  readonly color?: "primary" | "danger" | "secondary" | "link"
  readonly type?: "submit" | "reset" | "button" | undefined
  readonly name?: string | undefined
  readonly disabled?: boolean
  readonly value?: string | ReadonlyArray<string> | number | undefined
  readonly onClick?: (e: React.MouseEvent) => void
}
export const Button = ({
  loading = false,
  className = "",
  size = "normal",
  children,
  active,
  color,
  ...props
}: IButtonProps) => {
  const buttonSize =
    size === "small"
      ? "is-small"
      : size === "normal"
      ? "is-normal"
      : assertNever(size)
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={classNames("my-button", "br-6", className, buttonSize, {
        "is-primary": color === "primary",
        "is-danger": color === "danger",
        "is-secondary": color === "secondary",
        "is-link": color === "link",
        "is-loading": loading,
        "is-active": active,
      })}
    >
      {children}
    </button>
  )
}
