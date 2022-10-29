import { styled } from "@/theme"

const StyledFooter = styled.footer`
  font-weight: bold;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  margin-top: auto;
`

const Footer = () => (
  <StyledFooter>
    <span className="no-print">
      Recipe Yak • <a href="https://github.com/recipeyak/recipeyak">src</a>
    </span>
  </StyledFooter>
)

export default Footer
