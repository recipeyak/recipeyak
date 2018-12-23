import * as React from "react"

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
}
export const ButtonPlain = ({
  loading = false,
  className = "",
  children,
  ...props
}: IButtonProps) => (
  <button
    {...props}
    className={`my-button ${className} ${loading ? "is-loading" : ""}`}>
    {children}
  </button>
)

export const Button = ButtonPlain
