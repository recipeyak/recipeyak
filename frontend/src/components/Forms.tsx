import * as React from "react"

import { classNames } from "@/classnames"
import { styled } from "@/theme"

type Target = { select: () => void }

export const selectTarget = (e: { target: EventTarget | Target }) => {
  // hack to get around typescript not knowing about the select property
  if ("select" in e.target) {
    e.target.select()
  }
}

interface IFormErrorHandlerProps {
  readonly error: string[] | null | undefined
}

const Help = styled.div`
  display: block;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  color: var(--color-danger);
`

export const FormErrorHandler = ({ error }: IFormErrorHandlerProps) => {
  if (!error) {
    return null
  }
  return (
    <Help>
      <ul>
        {error.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </Help>
  )
}

interface ITypelessInput
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

export function CheckBox(props: ITypelessInput) {
  return <input {...props} type="checkbox" />
}

export function RadioButton(props: ITypelessInput) {
  return <input {...props} type="radio" />
}

interface IBaseInputProps
  extends Omit<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    "size"
  > {
  readonly size?: "small" | "normal" | "medium" | "large"
  readonly error?: boolean
  readonly isFocused?: boolean
}

const BaseInput = ({
  className = "",
  size = "normal",
  error = false,
  isFocused = false,
  ...props
}: IBaseInputProps) => {
  const inputSize = "is-" + size
  const cls = classNames(
    "my-input",
    inputSize,
    {
      "is-danger": error,
      "is-focused": isFocused,
    },
    className,
  )
  return <input className={cls} {...props} />
}

const createInput =
  (type: React.InputHTMLAttributes<HTMLInputElement>["type"]) =>
  (props: Omit<IBaseInputProps, "type">) =>
    <BaseInput {...props} type={type} />

export const TextInput = createInput("text")
export const SearchInput = createInput("search")
export const PasswordInput = createInput("password")
export const EmailInput = createInput("email")
export const DateInput = createInput("date")

const SelectWrapper = styled.div`
  display: inline-block;
  max-width: 100%;
  position: relative;
  vertical-align: top;
  height: 2.25em
  &::after {
    border: 1px solid var(--color-border);
    border-right: 0;
    border-top: 0;
    content: " ";
    display: block;
    height: 0.5em;
    pointer-events: none;
    position: absolute;
    transform: rotate(-45deg);
    width: 0.5em;
    margin-top: -0.375em;
    right: 1.125em;
    top: 50%;
    z-index: 4;
  }
  &:hover {
    &::after {
      border-color: var(--color-border);
    }
  }
  border-radius: 6px;
  font-size: 0.75rem;
`

const controlPaddingVertical = "calc(0.375em - 1px)"
const controlPaddingHorizontal = "calc(0.625em - 1px)"

const SelectInner = styled.select`
  -moz-appearance: none;
  -webkit-appearance: none;

  font-size: 0.75rem;
  font-weight: 600;

  align-items: center;
  border: 1px solid transparent;
  border-radius: 6px;
  box-shadow: none;
  display: inline-flex;
  height: 2.25em;
  justify-content: flex-start;
  line-height: 1.5;
  padding-bottom: ${controlPaddingVertical};
  padding-left: ${controlPaddingHorizontal};
  padding-right: ${controlPaddingHorizontal};
  padding-top: ${controlPaddingVertical};
  position: relative;
  vertical-align: top;
  background-color: var(--color-background-card);
  border-color: var(--color-border);
  color: var(--color-text);
  &:hover {
    border-color: var(--color-border);
  }
  &:focus,
  &:active {
    border-color: var(--color-border);
  }
  cursor: pointer;
  display: block;
  max-width: 100%;
  &:hover {
    border-color: var(--color-border);
  }
  &:focus,
  &:active {
    border-color: var(--color-border);
  }
  &::-ms-expand {
    display: none;
  }
  padding-right: 2.5em;
`

export function Select(props: {
  value: number | string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  disabled?: boolean
  children?: React.ReactNode
}) {
  return (
    <SelectWrapper>
      <SelectInner {...props} />
    </SelectWrapper>
  )
}
