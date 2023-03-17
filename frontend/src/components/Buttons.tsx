import * as React from "react"

import { Link } from "@/components/Routing"
import { css, keyframes, styled } from "@/theme"

const activeCss = `
  transform: translateY(1px);
`

const spinAround = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(359deg);
  }
`

const ButtonBase = styled.button<{
  isPrimary?: boolean
  isDanger?: boolean
  isLoading?: boolean
  isSmall?: boolean
  isLarge?: boolean
  isLink?: boolean
  isActive?: boolean
}>`
  align-items: center;
  border: 1px solid transparent;
  border-radius: 6px;
  display: inline-flex;
  font-size: 1rem;
  justify-content: flex-start;
  line-height: 1.5;
  padding-bottom: calc(0.375em - 1px);
  padding-left: calc(0.625em - 1px);
  padding-right: calc(0.625em - 1px);
  padding-top: calc(0.375em - 1px);
  position: relative;
  vertical-align: top;
  user-select: none;
  -webkit-user-select: none;

  background-color: var(--color-background-card);
  color: var(--color-text);
  border-color: var(--color-border);

  cursor: pointer;
  justify-content: center;
  padding-left: 0.75em;
  padding-right: 0.75em;
  text-align: center;
  white-space: nowrap;
  transition: all 0.2s;
  transition-property: translateY, border-color, box-shadow;
  text-decoration: none;
  font-family: BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    "Helvetica", "Arial", sans-serif;
  font-weight: 500;

  &:active:not([disabled]) {
    ${activeCss}
  }
  ${(p) => p.isActive && activeCss}

  &:focus:not([disabled]) {
    box-shadow: 0 0 5px 0px var(--color-primary-shadow);
  }

  @media (hover: hover) {
    &:hover:not([disabled]) {
      text-decoration: none;
    }
  }

  ${(p) =>
    p.isLink &&
    `
    background-color: transparent;
    border-color: transparent !important;
    color: var(--color-text);

    @media (hover: hover) {
      &:hover:not([disabled]) {
        text-decoration: underline;
        color: var(--color-text-disabled);
      }
    }

    &:focus:not([disabled]),
    &:active:not([disabled]) {
      text-decoration: underline;
      color: var(--color-text-disabled);
    }
    `}

  ${(p) =>
    p.isDanger &&
    `
    background-color: var(--color-danger);
    color: var(--color-danger-button-text);
    border-color: var(--color-danger) !important;

    &[disabled] {
      background-color: var(--color-danger-disabled);
    }
    `}

  ${(p) =>
    p.isPrimary &&
    `
    background-color: var(--color-primary);
    color: var(--color-primary-button-text);
    border-color: var(--color-primary);

    &:active:not([disabled]) {
      background-color: var(--color-primary-active) !important;
    }

    @media (hover: hover) {
      &:hover:not([disabled]) {
        background-color: var(--color-primary-active);
      }
    }

    &:focus {
      box-shadow: 0 0 5px var(--color-primary-shadow);
    }

    &[disabled] {
      background-color: var(--color-primary-disabled);
    }
    `}

  &[disabled] {
    color: var(--color-text-disabled);
    cursor: not-allowed;
  }

  ${(p) =>
    p.isLoading &&
    css`
      // hide text when loading
      color: transparent !important;
      &:after {
        animation: ${spinAround} 500ms infinite linear;
        border: 2px solid var(--color-border);
        border-radius: 290486px;
        border-right-color: transparent;
        border-top-color: transparent;
        content: "";
        display: block;
        height: 1em;
        position: relative;
        width: 1em;
        position: absolute;
        left: calc(50% - (1em / 2));
        top: calc(50% - (1em / 2));
      }
    `}

  ${(p) =>
    p.isSmall &&
    `
    border-radius: 2px;
    font-size: 0.75rem;
    `}

  ${(p) => p.isLarge && `font-size: 1.5rem;`}
  border-radius: 6px;
`

interface IButtonProps {
  readonly loading?: boolean
  readonly size?: "small" | "normal" | "large"
  readonly active?: boolean
  readonly style?: React.CSSProperties
  readonly className?: string
  readonly children: React.ReactNode
  readonly variant?: "primary" | "danger" | "link"
  readonly type?: "submit" | "reset" | "button" | undefined
  readonly name?: string | undefined
  readonly disabled?: boolean
  readonly value?: string | ReadonlyArray<string> | number | undefined
  readonly onClick?: (e: React.MouseEvent) => void
  readonly to?: string
}
export const Button = ({
  loading = false,
  className = "",
  size = "normal",
  children,
  active,
  variant,
  disabled,
  to,
  type = "button",
  ...props
}: IButtonProps) => {
  if (to != null) {
    return (
      <ButtonBase
        as={Link}
        {...props}
        to={to}
        isPrimary={variant === "primary"}
        isDanger={variant === "danger"}
        isLink={variant === "link"}
        isLoading={loading}
        isSmall={size === "small"}
        isLarge={size === "large"}
        isActive={active}
        className={className}
      >
        {children}
      </ButtonBase>
    )
  }

  return (
    <ButtonBase
      {...props}
      disabled={loading || disabled}
      type={type}
      isPrimary={variant === "primary"}
      isDanger={variant === "danger"}
      isLink={variant === "link"}
      isLoading={loading}
      isSmall={size === "small"}
      isLarge={size === "large"}
      isActive={active}
      className={className}
    >
      {children}
    </ButtonBase>
  )
}
