import { LocationDescriptor } from "history"
import * as React from "react"
import { ForwardedRef, forwardRef, useRef } from "react"
import { useButton, useFocusVisible, useHover } from "react-aria"
// eslint-disable-next-line no-restricted-imports
import { Button as AriaButton, PressEvent } from "react-aria-components"
import { Link } from "react-router-dom"

import { assertNever } from "@/assert"
import { clx } from "@/classnames"
import { focusVisibleStyles } from "@/components/ButtonStyles"

type Variant = "primary" | "danger" | "gradient" | "nostyle" | undefined
type Size = "normal" | "small" | "large"

function getVariantStyles(
  variant: Exclude<Variant, "nostyle">,
  isHovered: boolean,
  isPressed: boolean,
  isDisabled: boolean,
): string {
  switch (variant) {
    case undefined: {
      if (isDisabled) {
        return "border-[--color-normal-disabled-border] bg-[--color-normal-disabled-bg] text-[--color-normal-disabled-text]"
      }
      if (isPressed) {
        return "border-[--color-normal-active-border] bg-[--color-normal-active-bg] text-[--color-normal-active-text]"
      }
      if (isHovered) {
        return "border-[--color-normal-hover-border] bg-[--color-normal-hover-bg] text-[--color-normal-hover-text]"
      }
      return "border-[--color-normal-default-border] bg-[--color-normal-default-bg] text-[--color-normal-default-text]"
    }
    case "primary": {
      if (isDisabled) {
        return "border-[--color-primary-disabled-border] bg-[--color-primary-disabled-bg] text-[--color-primary-disabled-text]"
      }
      if (isPressed) {
        return "border-[--color-primary-active-border] bg-[--color-primary-active-bg] text-[--color-primary-active-text]"
      }
      if (isHovered) {
        return "border-[--color-primary-hover-border] bg-[--color-primary-hover-bg] text-[--color-primary-hover-text]"
      }
      return "border-[--color-primary-default-border] bg-[--color-primary-default-bg] text-[--color-primary-default-text]"
    }
    case "danger": {
      if (isDisabled) {
        return "border-[--color-danger-disabled-border] bg-[--color-danger-disabled-bg] text-[--color-danger-disabled-text]"
      }
      if (isHovered) {
        return "border-[--color-danger-hover-border] bg-[--color-danger-hover-bg] text-[--color-danger-hover-text]"
      }
      if (isPressed) {
        return "border-[--color-danger-active-border] bg-[--color-danger-active-bg]"
      }
      return "border-[--color-danger-default-border] bg-[--color-danger-default-bg] text-[--color-danger-default-text]"
    }
    case "gradient":
      return "pointer-events-auto !border-none text-white !shadow-none backdrop-blur-[10px] ![background-color:rgba(0,0,0,0.46)]"
    default:
      assertNever(variant)
  }
}

function getSizeStyles(size: Size): string {
  switch (size) {
    case "normal":
      return "text-base"
    case "small":
      return "text-xs"
    case "large":
      return "!text-2xl"
    default:
      assertNever(size)
  }
}

function getBaseStyles(size: Size, isFocusVisible: boolean): string {
  return clx(
    "relative inline-flex cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-md border border-solid p-0 px-3 py-1 text-center align-top text-sm font-medium leading-[1.5] no-underline transition-[border-color,background-color] duration-75 disabled:cursor-default print:!hidden",
    focusVisibleStyles(isFocusVisible),
    getSizeStyles(size),
  )
}

function getButtonStyles({
  variant,
  size,
  isFocusVisible,
  isHovered,
  isPressed,
  isDisabled,
}: {
  variant: Variant
  size: Size
  isFocusVisible: boolean
  isHovered: boolean
  isPressed: boolean
  isDisabled: boolean
}) {
  if (variant === "nostyle") {
    return ""
  }
  return clx(
    getBaseStyles(size, isFocusVisible),
    getVariantStyles(variant, isHovered, isPressed, isDisabled),
  )
}

function LinkButton({
  disabled,
  to,
  variant,
  size,
  className,
  children,
  active,
  ...props
}: {
  disabled: boolean | undefined
  to: string | LocationDescriptor<unknown>
  variant: Variant
  size: Size
  active: boolean
  className: string | undefined
  children: React.ReactNode
  style?: React.CSSProperties | undefined
}) {
  // We don't want focus rings to appear on non-keyboard devices like iOS, so
  // we have to do some JS land stuff
  const { isFocusVisible } = useFocusVisible()
  const linkRef = useRef<HTMLAnchorElement>(null)
  const { buttonProps: buttonLinkProps, isPressed: isLinkPressed } = useButton(
    {
      isDisabled: disabled,
    },
    linkRef,
  )
  const { hoverProps, isHovered: isLinkHovered } = useHover({
    isDisabled: disabled,
  })

  return (
    <Link
      {...props}
      {...buttonLinkProps}
      {...hoverProps}
      to={to}
      ref={linkRef}
      className={clx(
        className,
        getButtonStyles({
          variant,
          size,
          isFocusVisible,
          isHovered: isLinkHovered,
          isPressed: isLinkPressed || active,
          isDisabled: disabled ?? false,
        }),
      )}
    >
      {children}
    </Link>
  )
}

export const Button = forwardRef(
  (
    {
      loading,
      className,
      size = "normal",
      children,
      variant,
      active: isActive = false,
      disabled,
      type,
      ...props
    }: {
      size?: "small" | "normal" | "large"
      style?: React.CSSProperties
      className?: string
      active?: boolean
      children: React.ReactNode
      variant?: Variant
      type?: "submit" | "reset" | "button" | undefined
      loading?: boolean
      disabled?: boolean
    } & (
      | {
          onClick?: undefined
          to: string | LocationDescriptor<unknown>
        }
      | {
          onClick?: (e: PressEvent) => void
          onKeyDown?: ((e: React.KeyboardEvent) => void) | undefined
          onPressStart?: (e: PressEvent) => void
          to?: undefined
        }
    ),
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    if (props.to != null) {
      return (
        <LinkButton
          {...props}
          disabled={disabled}
          to={props.to}
          variant={variant}
          active={isActive}
          size={size}
          className={className}
          children={children}
        />
      )
    }

    return (
      <AriaButton
        ref={ref}
        onKeyDown={props.onKeyDown}
        onPressStart={props.onPressStart}
        style={props.style}
        onPress={props.onClick}
        isDisabled={loading || disabled}
        type={type ?? "button"}
        className={(p) =>
          clx(
            className,
            getButtonStyles({
              variant,
              size,
              isFocusVisible: p.isFocusVisible,
              isHovered: p.isHovered,
              isPressed: p.isPressed || isActive,
              isDisabled: p.isDisabled,
            }),
          )
        }
      >
        {children}
      </AriaButton>
    )
  },
)
