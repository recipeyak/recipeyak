import * as React from "react"

interface IFormErrorHandlerProps {
  readonly error: string[] | null
}

export const FormErrorHandler = ({ error }: IFormErrorHandlerProps) =>
  !!error && (
    <div className="help is-danger">
      <ul>
        {error.map(e => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  )

export const TextInput = ({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  return <input type="text" className={"my-input " + className} {...props} />
}
