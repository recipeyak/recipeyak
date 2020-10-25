import React from "react"
import ReactMarkdown, { NodeType } from "react-markdown"
import { styled } from "@/theme"
import * as settings from "@/settings"
import { Link } from "@/components/Routing"

const MarkdownWrapper = styled.div`
  a {
    text-decoration: underline;
  }
  a:hover {
    text-decoration: none;
  }
  ul {
    list-style-type: disc;
    padding-left: 1.5rem;
  }

  ol {
    padding-left: 1.5rem;
  }
`

const ALLOWED_MARKDOWN_TYPES: NodeType[] = [
  "root",
  "text",
  "delete",
  "paragraph",
  "strong",
  "emphasis",
  "list",
  "linkReference",
  "link",
  "listItem",
]

function renderLink({
  href,
  ...props
}: React.DetailedHTMLProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>) {
  if (href && href.startsWith(settings.DOMAIN)) {
    const to = new URL(href).pathname
    return <Link {...props} to={to} children={to.substring(1)} />
  }
  return <a {...props} href={href} />
}

const renderers = {
  link: renderLink,
  linkReference: renderLink,
}

interface IMarkdownProps {
  readonly children: string
  readonly onClick?: (_: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  readonly className?: string
  readonly title?: string
}

export function Markdown({
  children: text,
  className,
  title,
  onClick,
}: IMarkdownProps) {
  return (
    <MarkdownWrapper className={className} title={title} onClick={onClick}>
      <ReactMarkdown
        allowedTypes={ALLOWED_MARKDOWN_TYPES}
        source={text}
        renderers={renderers}
        unwrapDisallowed
      />
    </MarkdownWrapper>
  )
}
