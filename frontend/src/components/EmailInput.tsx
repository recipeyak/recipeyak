import { omit } from "lodash-es"
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
      // eslint-disable-next-line react/forbid-elements
      <input
        type="email"
        autoComplete="username"
        spellCheck="false"
        autoCapitalize="none"
        className={inputStyles(props)}
        {...omit(props, "className")}
        ref={ref}
      />
    )
  },
)
