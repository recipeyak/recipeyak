import { Link as RRLink, LinkProps as RRLinkProps } from "react-router-dom"

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
