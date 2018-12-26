import React from "react"
import { Link, NavLinkProps } from "react-router-dom"

export const NavLink = ({
  to,
  pathname,
  className = "",
  activeClassName = "active",
  activeStyle,
  exact,
  strict,
  isActive,
  location
}: NavLinkProps & { pathname: string }) => {
  const activeClass = pathname === to ? activeClassName : ""
  return (
    // keep react from warning about dispatch being passed down
    <Link
      to={to}
      className={className + " " + activeClass}
      {...{ activeStyle, exact, strict, isActive, location }}
    />
  )
}

export default NavLink
