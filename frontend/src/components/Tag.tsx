import { styled } from "@/theme"

const TagInner = styled.span<{
  fontWeight?: React.CSSProperties["fontWeight"]
  selectable?: boolean
}>`
  align-items: center;
  background-color: var(--color-background-card);
  border-radius: 290486px;
  color: var(--color-text);
  display: inline-flex;
  font-size: 0.75rem;
  height: 2em;
  justify-content: center;
  line-height: 1.5;
  padding-left: 0.875em;
  padding-right: 0.875em;
  white-space: nowrap;
  ${(p) => p.fontWeight && `font-weight: ${p.fontWeight}`}
  ${(p) =>
    p.selectable &&
    `user-select: text !important;
  -webkit-user-select: text !important;
  cursor: auto !important;`}
`

export function Tag({
  children,
  fontWeight,
  selectable,
}: {
  children: React.ReactNode
  fontWeight?: string
  selectable?: boolean
}) {
  return (
    <TagInner fontWeight={fontWeight} selectable={selectable}>
      {children}
    </TagInner>
  )
}
