import React from "react"
import ReactMarkdown, { NodeType } from "react-markdown"
const ALLOWED_MARKDOWN_TYPES: NodeType[] = [
  "root",
  "text",
  "delete",
  "paragraph",
  "strong",
  "emphasis",
  "paragraph"
]

interface IMarkdownProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  readonly children: string
}

export function Markdown({ children: text, ...rest }: IMarkdownProps) {
  return (
    <div {...rest}>
      <ReactMarkdown
        allowedTypes={ALLOWED_MARKDOWN_TYPES}
        source={text}
        unwrapDisallowed
      />
    </div>
  )
}
