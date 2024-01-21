import { Link as RRLink, NavLinkProps, useLocation } from "react-router-dom"

export const Link = RRLink

export const NavLink = ({
  to,
  className = "",
  activeClassName = "active",
  onClick,
  children,
}: {
  className?: string
  activeClassName?: string
  to: NavLinkProps["to"]
  onClick?: () => void
  children?: React.ReactNode
}) => {
  const location = useLocation()
  const activeClass = location.pathname === to ? activeClassName : ""
  return (
    <RRLink
      to={to}
      className={className + " " + activeClass}
      onClick={onClick}
      children={children}
    />
  )
}
