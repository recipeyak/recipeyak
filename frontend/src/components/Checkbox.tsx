import * as React from "react"

interface ITypelessInput
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

export function CheckBox(props: ITypelessInput) {
  return <input {...props} type="checkbox" />
}
