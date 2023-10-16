import React from "react"
import ReactMarkdown, { Components } from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import smartypants from "remark-smartypants"

import { Link } from "@/components/Routing"
import * as settings from "@/settings"
import { styled } from "@/theme"

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

  p:not(:last-child) {
    margin-bottom: 0.5rem;
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
`

const ALLOWED_MARKDOWN_TYPES: (keyof Components)[] = [
  "text",
  "s",
  "br",
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
  if (href?.startsWith(settings.DOMAIN)) {
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
        remarkPlugins={[
          // enable auto-linking of urls & other github flavored markdown features
          remarkGfm,
          // make new lines behave like github comments
          //
          //   Mars is
          //   the fourth planet
          //
          // becomes:
          //
          //   <p>Mars is<br>
          //   the fourth planet</p>
          //
          // instead of without the plugin:
          //
          //   <p>Mars is
          //   the fourth planet</p>
          //
          remarkBreaks,
          // auto convert -- to em dash and similar
          smartypants,
        ]}
        children={text}
        components={renderers}
        unwrapDisallowed
      />
    </MarkdownWrapper>
  )
}
