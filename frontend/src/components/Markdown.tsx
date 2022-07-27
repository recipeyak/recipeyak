import React from "react"
import ReactMarkdown, { Components } from "react-markdown"
import { styled } from "@/theme"
import * as settings from "@/settings"
import { Link } from "@/components/Routing"

const MarkdownWrapper = styled.div`
  word-break: break-word;
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

  blockquote {
    padding-left: 0.25rem;
    border-left: 5px solid lightgray;
    & > p {
      margin-bottom: 0rem;
    }

    &:last-of-type > p {
      margin-bottom: 0.5rem;
    }
  }

  p {
    margin-bottom: 0.5rem;
  }
`

const ALLOWED_MARKDOWN_TYPES: (keyof Components)[] = [
  "text",
  "s",
  "blockquote",
  "p",
  "strong",
  "em",
  "li",
  "a",
  "link",
  "ol",
  "ul",
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
  a: renderLink,
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
        allowedElements={ALLOWED_MARKDOWN_TYPES}
        children={text}
        components={renderers}
        unwrapDisallowed
      />
    </MarkdownWrapper>
  )
}
