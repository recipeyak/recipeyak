import * as React from "react"

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

interface ITextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  readonly size?: "small" | "normal" | "medium" | "large"
}

export const TextInput = ({
  className = "",
  size = "normal",
  ...props
}: ITextInputProps) => {
  const inputSize = "is-" + size
  return (
    <input
      type="text"
      className={`my-input ${inputSize} ` + className}
      {...props}
    />
  )
}

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
