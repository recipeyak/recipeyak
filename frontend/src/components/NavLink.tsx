import React from "react"
import { Link, NavLinkProps } from "react-router-dom"

export const NavLink = ({
  to,
  pathname,
  className = "",
  activeClassName = "active",
  ...props
}: NavLinkProps & { readonly pathname: string }) => {
  const activeClass = pathname === to ? activeClassName : ""
  return <Link to={to} className={className + " " + activeClass} {...props} />
}

export default NavLink
