import * as React from "react"

interface ITypelessInput
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

export function RadioButton(props: ITypelessInput) {
  return <input {...props} type="radio" />
}
