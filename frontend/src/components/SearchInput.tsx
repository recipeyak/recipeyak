import { omit } from "lodash-es"
import { ForwardedRef, forwardRef } from "react"

import { inputStyles } from "@/components/inputStyles"

export const SearchInput = forwardRef(
  (
    props: Omit<
      React.ComponentProps<"input">,
      "type" | "autoComplete" | "spellCheck"
    > & {
      error?: boolean
    },
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      <input
        {...omit(props, "className")}
        type="search"
        autoComplete="off"
        spellCheck="false"
        className={inputStyles(props)}
        ref={ref}
      />
    )
  },
)
