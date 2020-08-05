import React from "react"
import ReactMarkdown, { NodeType } from "react-markdown"
import { styled } from "@/theme"

const MarkdownWrapper = styled.div`
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
  "listItem"
]

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
  onClick
}: IMarkdownProps) {
  return (
    <MarkdownWrapper className={className} title={title} onClick={onClick}>
      <ReactMarkdown
        allowedTypes={ALLOWED_MARKDOWN_TYPES}
        source={text}
        unwrapDisallowed
      />
    </MarkdownWrapper>
  )
}
