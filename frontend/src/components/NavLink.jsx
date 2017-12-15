import React from 'react'

export const NavLink = ({
  to,
  pathname,
  navigateTo,
  className,
  activeClassName = 'active',
  ...props
}) => {
  const activeClass = pathname === to
    ? activeClassName
    : ''
  return (
    <a onClick={() => navigateTo(to)}
       { ...props }
       className={ className + ' ' + activeClass }
    ></a>
  )
}

export default NavLink
