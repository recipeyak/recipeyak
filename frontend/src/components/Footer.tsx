import { styled } from "@/theme"
import * as React from "react"

const StyledFooter = styled.footer`
  font-weight: bold;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  margin-top: auto;
`

const Footer = () => (
  <StyledFooter>
    <span>
      Recipe Yak • <a href="https://github.com/recipeyak/recipeyak">src</a>
    </span>
    <span>Est. 2017</span>
  </StyledFooter>
)

export default Footer
