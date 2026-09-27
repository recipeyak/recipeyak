import { clx } from "@/classnames"

export function focusVisibleStyles(isFocusVisible: boolean): string {
  return isFocusVisible
    ? clx(
        "focus-visible:outline-[3px] focus-visible:-outline-offset-2 focus-visible:outline-[rgb(47,129,247)] focus-visible:outline-solid",
      )
    : "outline-hidden"
}
