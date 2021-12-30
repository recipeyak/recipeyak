import React from "react"
import { useRouter } from "next/router"

import Link from "next/link"

export const NavLink = ({
  to,
  className = "",
  activeClassName = "active",
  children,
}: {
  to: string
  className: string
  activeClassName?: string
  children: React.ReactNode
}) => {
  const router = useRouter()
  const activeClass = router.pathname === to ? activeClassName : ""
  return (
    <Link href={to}>
      <a className={className + " " + activeClass} children={children} />
    </Link>
  )
}

export default NavLink
