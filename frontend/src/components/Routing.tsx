import { Link as RRLink, NavLinkProps, useLocation } from "react-router-dom"

import { clx } from "@/classnames"

export const NavLink = ({
  to,
  className,
  activeClassName,
  onClick,
  children,
}: {
  className?: string
  activeClassName: string
  to: NavLinkProps["to"]
  onClick?: () => void
  children?: React.ReactNode
}) => {
  const location = useLocation()
  return (
    <RRLink
      to={to}
      className={clx(className, location.pathname === to && activeClassName)}
      onClick={onClick}
      children={children}
    />
  )
}
