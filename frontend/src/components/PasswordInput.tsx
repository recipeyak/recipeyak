import { ForwardedRef, forwardRef } from "react"

import { inputStyles } from "@/components/inputStyles"

export const PasswordInput = forwardRef(
  (
    props: Omit<React.ComponentProps<"input">, "type"> & {
      error?: boolean
    },
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      <input
        type="password"
        className={inputStyles(props)}
        {...props}
        ref={ref}
      />
    )
  },
)
