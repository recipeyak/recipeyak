import React from 'react'
import {
  Link
} from 'react-router-dom'

export const NavLink = ({
  to,
  pathname,
  className,
  activeClassName = 'active',
  ...props
}) => {
  const activeClass = pathname === to
    ? activeClassName
    : ''
  return (
    <Link
      to={ to }
      { ...props }
      className={ className + ' ' + activeClass }
    />
  )
}

export default NavLink
