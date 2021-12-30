import React from "react"

import NLink from "next/link"

interface ILinkProps {
  readonly isRaw?: boolean
  readonly to: string
}

export function Link({ to, isRaw, ...rest }: ILinkProps) {
  if (isRaw) {
    return <a href={to} {...rest} />
  }
  return <NLink href={to} {...rest} />
}
