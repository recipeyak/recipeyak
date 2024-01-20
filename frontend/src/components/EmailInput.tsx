import { ForwardedRef, forwardRef } from "react"

import { inputStyles } from "@/components/inputStyles"

export const EmailInput = forwardRef(
  (
    props: Omit<React.ComponentProps<"input">, "type"> & {
      error?: boolean
    },
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      <input type="email" className={inputStyles(props)} {...props} ref={ref} />
    )
  },
)
