// eslint-disable-next-line no-restricted-imports
import { MenuItem as AriaMenuItem, MenuItemProps } from "react-aria-components"

import { clx } from "@/classnames"

export function MenuItem(
  props: Omit<MenuItemProps, "className"> & { isInfo?: boolean },
) {
  return (
    <AriaMenuItem
      {...props}
      className={(p) =>
        clx(
          "flex rounded px-2 py-1",
          !props.isInfo &&
            "cursor-pointer [transition:background_.12s_ease-out] hover:bg-[--color-border]",
          // Only show the focus ring on keyboard devices
          p.isFocusVisible
            ? "focus-visible:outline-[3px] focus-visible:-outline-offset-2 focus-visible:outline-[rgb(47,129,247)]"
            : "outline-none",
        )
      }
    />
  )
}
