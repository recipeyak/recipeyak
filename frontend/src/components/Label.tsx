import { styled } from "@/theme"

export const Label = styled.label`
  display: block;
  font-size: 1rem;
  font-weight: 700;
  &:not(:last-child) {
    margin-bottom: 0.5em;
  }
`

export const BetterLabel = styled.label`
  font-weight: bold;
  margin-right: 0.75rem;
`
