import * as React from "react"
// eslint-disable-next-line no-restricted-imports
import TextareaAutosize from "react-textarea-autosize"

import { clx } from "@/classnames"

export function Textarea({
  isError,
  minimized,
  bottomFlat,
  ...props
}: Omit<React.ComponentProps<typeof TextareaAutosize>, "className" | "ref"> & {
  isError?: boolean
  minimized?: boolean
  bottomFlat?: boolean
}) {
  return (
    <TextareaAutosize
      {...props}
      className={clx(
        "relative z-[1] block w-full min-w-full max-w-full resize-y appearance-none items-center justify-start rounded-md border border-solid border-[--color-border] bg-[--color-background-card] px-3 py-2 text-base text-[--color-text] shadow-none transition-[border-color,box-shadow] duration-200 [box-shadow:inset_0_1px_2px_rgba(10,10,10,0.1)] placeholder:text-[--color-input-placeholder]",
        isError && "border-[--color-danger]",
        !minimized && "max-h-[600px] min-h-[120px] leading-[1.5]",
        bottomFlat && "rounded-b-[unset]",
      )}
    />
  )
}
