import * as React from "react"

interface ITypelessInput
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

export function CheckBox(props: ITypelessInput) {
  // eslint-disable-next-line react/forbid-elements
  return <input {...props} type="checkbox" />
}
