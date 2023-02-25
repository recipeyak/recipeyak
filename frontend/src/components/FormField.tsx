import { styled } from "@/theme"

export const FormField = styled.div<{ isGrouped?: boolean }>`
  &:not(:last-child) {
    margin-bottom: 0.75rem;
  }
  ${(p) =>
    p.isGrouped &&
    `
    display: flex;
    justify-content: flex-start;
    gap: 0.5rem;
  `}
`
