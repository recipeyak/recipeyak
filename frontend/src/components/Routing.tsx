import type { LinkProps as RRLinkProps, NavLinkProps } from "react-router-dom"
import { Link as RRLink, useLocation } from "react-router-dom"

interface ILinkProps extends RRLinkProps {
  readonly isRaw?: boolean
  readonly to: string
}

export function Link({ to, replace, isRaw, ...rest }: ILinkProps) {
  if (isRaw) {
    return <a href={to} {...rest} />
  }
  return <RRLink to={to} replace={replace} {...rest} />
}

export const NavLink = ({
  to,
  className = "",
  activeClassName = "active",
  onClick,
  children,
}: {
  className: string
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
