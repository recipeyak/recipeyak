import { styled } from "@/theme"

export const BorderBox = styled.div<{
  display?: "block" | "flex"
  flexDirection?: "column"
  h?: 100
  p?: 3 | 2
  minHeight?: string
}>`
  background-color: var(--color-background);
  border-radius: 6px;
  color: var(--color-text);
  display: ${(p) => p.display};
  padding: 1.25rem;
  ${(p) => p.flexDirection && `flex-direction: ${p.flexDirection};`}
  ${(p) => (p.h === 100 ? `height: 100%;` : "")}
  ${(p) =>
    p.p === 3 ? "padding: 0.75rem;" : p.p === 2 ? "padding: 0.5rem;" : ""}
    ${(p) => p.minHeight && `min-height: 75px;`}
  &:not(:last-child) {
    margin-bottom: 1.5rem;
  }
`
