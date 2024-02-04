import { omit } from "lodash-es"
import { ForwardedRef, forwardRef } from "react"

import { inputStyles } from "@/components/inputStyles"

export const DateInput = forwardRef(
  (
    props: Omit<React.ComponentProps<"input">, "type"> & {
      error?: boolean
    },
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      // eslint-disable-next-line react/forbid-elements
      <input
        type="date"
        className={inputStyles(props)}
        {...omit(props, "className")}
        ref={ref}
      />
    )
  },
)
