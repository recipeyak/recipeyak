import { Link, NavLinkProps } from "react-router-dom"

export const NavLink = ({
  to,
  pathname,
  className = "",
  activeClassName = "active",
  onClick,
  children,
}: {
  pathname: string
  className: string
  activeClassName?: string
  to: NavLinkProps["to"]
  onClick?: () => void
  children?: React.ReactNode
}) => {
  const activeClass = pathname === to ? activeClassName : ""
  return (
    <Link
      to={to}
      className={className + " " + activeClass}
      onClick={onClick}
      children={children}
    />
  )
}

export default NavLink
