import React from "react"

import { Link } from "@/components/Routing"
import { css, styled } from "@/theme"
import { useOnClickOutside } from "@/useOnClickOutside"

export const DropdownContainer = styled.div`
  position: relative;
`

const dropdownItemStyle = css`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0.25rem 0.5rem;
  font-weight: 400;
  color: var(--color-text);
  white-space: nowrap;
  text-align: left;

  @media (hover: hover) {
    :hover {
      color: var(--color-text);
      text-decoration: none;
    }
  }

  :active {
    background-color: ${(p) => p.theme.color.primaryShadow};
  }

  cursor: pointer;

  font-family: inherit;
  font-size: inherit;
  line-height: inherit;

  background-color: transparent;
  border: none;
`

export const DropdownItemLink = styled(Link)`
  ${dropdownItemStyle}
`

export const DropdownItemButton = styled.button`
  ${dropdownItemStyle}
`

const isOpenStyle = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

export const DropdownMenu = styled.div<{
  readonly isOpen: boolean
  readonly position: "right" | "left"
}>`
  position: absolute;
  ${(props) =>
    props.position === "left"
      ? css`
          right: auto;
          left: 0;
        `
      : css`
          right: 0;
          left: auto;
        `}
  z-index: 1000;
  padding: 0.5rem;
  margin: 0.125rem 0 0;
  font-size: 1rem;
  white-space: nowrap;

  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  display: none;

  ${(p) => p.isOpen && isOpenStyle}
`
export function useDropdown() {
  const [isOpen, setIsOpen] = React.useState(false)
  const closeDropdown = React.useCallback(() => {
    setIsOpen(false)
  }, [])
  const toggle = React.useCallback(() => {
    setIsOpen((p) => !p)
  }, [])
  const ref = useOnClickOutside<HTMLDivElement>(closeDropdown)
  return { ref, toggle, close: closeDropdown, isOpen, setIsOpen }
}
