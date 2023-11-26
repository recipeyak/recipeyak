import { styled } from "@/theme"

export const Card = styled.div`
  background-color: var(--color-background-card);
  box-shadow:
    0 2px 3px hsla(0, 0%, 4%, 0.1),
    0 0 0 1px hsla(0, 0%, 4%, 0.1);
  display: flex;
  flex-direction: column;
`

export const CardContent = styled.div`
  padding: 0.5rem;
`
