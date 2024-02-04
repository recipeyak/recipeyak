import { omit } from "lodash-es"
import { ForwardedRef, forwardRef } from "react"

import { inputStyles } from "@/components/inputStyles"

export const SearchInput = forwardRef(
  (
    props: Omit<
      React.ComponentProps<"input">,
      "type" | "autoComplete" | "spellCheck" | "autoCapitalize" | "autoCorrect"
    > & {
      error?: boolean
    },
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    return (
      // eslint-disable-next-line react/forbid-elements
      <input
        {...omit(props, "className")}
        type="search"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
        className={props.className ?? inputStyles(props)}
        ref={ref}
      />
    )
  },
)
