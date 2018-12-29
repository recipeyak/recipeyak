import * as React from "react"
import { classNames } from "@/classnames"

export const ButtonLink = (props: IButtonProps) => (
  <ButtonPlain {...props} className={props.className + " is-link"} />
)

export const ButtonPrimary = (props: IButtonProps) => (
  <ButtonPlain {...props} className={props.className + " is-primary"} />
)

export const ButtonDanger = (props: IButtonProps) => (
  <ButtonPlain {...props} className={props.className + " is-danger"} />
)

export const ButtonSecondary = (props: IButtonProps) => (
  <ButtonPlain {...props} className={props.className + " is-secondary"} />
)

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly loading?: boolean
  readonly size?: "small" | "normal" | "medium" | "large"
}
export const ButtonPlain = ({
  loading = false,
  className = "",
  size = "normal",
  children,
  ...props
}: IButtonProps) => {
  const buttonSize = "is-" + size
  return (
    <button
      {...props}
      className={classNames("my-button", className, buttonSize, {
        "is-loading": loading
      })}>
      {children}
    </button>
  )
}

export const Button = ButtonPlain
