import { omit } from "lodash-es"
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
      // eslint-disable-next-line react/forbid-elements
      <input
        type="password"
        className={inputStyles(props)}
        {...omit(props, "className")}
        ref={ref}
      />
    )
  },
)
