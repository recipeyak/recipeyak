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
    // keep react from warning about dispatch being passed down
    <Link
      to={ to }
      { ...props }
      dispatch={ '' }
      className={ className + ' ' + activeClass }
    />
  )
}

export default NavLink
