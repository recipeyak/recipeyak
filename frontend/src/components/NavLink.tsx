import { Link } from "react-aria-components"
import { useLocation } from "react-router-dom"

import { clx } from "@/classnames"

export const NavLink = ({
  to,
  children,
  className,
  noActiveState,
}: {
  to: string
  children?: React.ReactNode
  className?: string
  noActiveState?: boolean
}) => {
  const location = useLocation()
  return (
    <Link
      href={to}
      className={(p) =>
        clx(
          "flex shrink-0 grow-0 cursor-pointer items-center justify-center gap-2 rounded-md px-2 py-1 text-[14px] font-medium leading-[1.5] text-[--color-text] transition-all [transition:background_.12s_ease-out]",
          p.isHovered &&
            "bg-[--color-background-calendar-day] text-[--color-link-hover]",
          p.isPressed && "bg-[--color-border]",
          // Only show the focus ring on keyboard devices
          p.isFocusVisible
            ? "focus-visible:outline-[3px] focus-visible:-outline-offset-2 focus-visible:outline-[rgb(47,129,247)]"
            : "outline-none",
          !noActiveState &&
            location.pathname === to &&
            "bg-[--color-background-calendar-day]",
          className,
        )
      }
      children={children}
    />
  )
}
