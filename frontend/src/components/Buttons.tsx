import * as React from "react"

export const ButtonLink = (props: IButtonProps) => (
  <ButtonPlain className={props.className + " is-link"} {...props} />
)

export const ButtonPrimary = (props: IButtonProps) => (
  <ButtonPlain className={props.className + " is-primary"} {...props} />
)

export const ButtonDanger = (props: IButtonProps) => (
  <ButtonPlain className={props.className + " is-danger"} {...props} />
)

export const ButtonSecondary = (props: IButtonProps) => (
  <ButtonPlain className={props.className + " is-secondary"} {...props} />
)

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly loading?: boolean
}
export const ButtonPlain = ({
  loading = false,
  className = "",
  children,
  ...props
}: IButtonProps) => (
  <button
    className={`my-button ${className} ${loading ? "is-loading" : ""}`}
    {...props}>
    {children}
  </button>
)

export const Button = ButtonPlain
