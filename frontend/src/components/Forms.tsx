import * as React from "react"
import { classNames } from "@/classnames"

type Target = { select: () => void }

export const selectTarget = (e: { target: EventTarget | Target }) => {
  // hack to get around typescript not knowing about the select property
  if ("select" in e.target) {
    e.target.select()
  }
}

interface IFormErrorHandlerProps {
  readonly error: string[] | null | undefined
}

export const FormErrorHandler = ({ error }: IFormErrorHandlerProps) => {
  if (!error) {
    return null
  }
  return (
    <div className="help is-danger">
      <ul>
        {error.map(e => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  )
}

interface ITypelessInput
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

export function CheckBox(props: ITypelessInput) {
  return <input {...props} type="checkbox" />
}

export function RadioButton(props: ITypelessInput) {
  return <input {...props} type="radio" />
}

interface IBaseInputProps
  extends Omit<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    "size"
  > {
  readonly size?: "small" | "normal" | "medium" | "large"
  readonly error?: boolean
  readonly isFocused?: boolean
}

const BaseInput = ({
  className = "",
  size = "normal",
  error = false,
  isFocused = false,
  ...props
}: IBaseInputProps) => {
  const inputSize = "is-" + size
  const cls = classNames(
    "my-input",
    inputSize,
    {
      "is-danger": error,
      "is-focused": isFocused
    },
    className
  )
  return <input className={cls} {...props} />
}

const createInput = (
  type: React.InputHTMLAttributes<HTMLInputElement>["type"]
) => (props: Omit<IBaseInputProps, "type">) => (
  <BaseInput {...props} type={type} />
)

export const TextInput = createInput("text")
export const PasswordInput = createInput("password")
export const EmailInput = createInput("email")
export const DateInput = createInput("date")

interface ISelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  readonly size?: "small" | "normal" | "medium" | "large"
  readonly noBorder?: boolean
}

export function Select({
  className,
  size = "normal",
  multiple,
  noBorder,
  ...props
}: ISelectProps) {
  const inputSize = "is-" + size
  const multipleClass = multiple ? "is-multiple" : ""
  const selectClass = noBorder ? "my-select" : ""
  return (
    <div className={`select ${inputSize} ${multipleClass} ${className}`}>
      <select className={selectClass} multiple={multiple} {...props} />
    </div>
  )
}
