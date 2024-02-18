import * as React from "react"
import { useEffect, useRef } from "react"
// eslint-disable-next-line no-restricted-imports
import TextareaAutosize from "react-textarea-autosize"

import { clx } from "@/classnames"

/** only run the function once on mount */
function useOnMount(cb: () => void) {
  const isMounted = useRef(false)
  const cbRef = useRef(cb)
  useEffect(() => {
    if (!isMounted.current) {
      cbRef.current()
      isMounted.current = true
    }
  }, [])
}

export function Textarea({
  isError,
  minimized,
  bottomFlat,
  inputRef,
  ...props
}: Omit<
  React.ComponentProps<typeof TextareaAutosize>,
  "className" | "ref" | "inputRef" | "value" | "defaultValue"
> & {
  isError?: boolean
  minimized?: boolean
  bottomFlat?: boolean
  inputRef?: React.RefObject<HTMLTextAreaElement>
  value?: string
  defaultValue?: string
}) {
  const inputRef_ = useRef<HTMLTextAreaElement>(null)
  const ref = inputRef ?? inputRef_
  useOnMount(() => {
    // workaround for https://stackoverflow.com/q/4360542/3720597 onfocus not
    // being called when autoFocus is used to focus the element
    const val = props.value ?? props.defaultValue
    if (props.autoFocus && val != null) {
      // Move cursor to the end of the input when we mount the text area -- it's
      // a nicer experience than the default of the start of the textarea
      ref.current?.setSelectionRange(val.length, val.length)
    }
  })
  return (
    <TextareaAutosize
      {...props}
      ref={ref}
      className={clx(
        "relative z-[1] block w-full min-w-full max-w-full resize-y appearance-none items-center justify-start rounded-md border border-solid border-[--color-border] bg-[--color-background-card] px-3 py-2 text-base text-[--color-text] shadow-none transition-[border-color,box-shadow] duration-200 [box-shadow:inset_0_1px_2px_rgba(10,10,10,0.1)] placeholder:text-[--color-input-placeholder]",
        isError && "border-[--color-danger]",
        !minimized && "max-h-[600px] min-h-[120px] leading-[1.5]",
        bottomFlat && "rounded-b-[unset]",
      )}
    />
  )
}
