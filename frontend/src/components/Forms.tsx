import * as React from "react"
import TextareaAutosize from "react-textarea-autosize"

import { styled } from "@/theme"

interface IFormErrorHandlerProps {
  readonly error: string[] | null | undefined
}

export const FormErrorHandler = ({ error }: IFormErrorHandlerProps) => {
  if (!error) {
    return null
  }
  return (
    <div className="mt-1 block text-xs text-[var(--color-danger)]">
      <ul>
        {error.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
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

const StyledInput = styled.input<{ isDanger?: boolean }>`
  -moz-appearance: none;
  -webkit-appearance: none;
  align-items: center;
  border: 1px solid transparent;
  box-shadow: none;
  font-size: 1rem;
  justify-content: flex-start;
  padding-bottom: 5px;
  padding-top: 5px;
  padding-left: 6px;
  padding-right: 6px;
  position: relative;
  vertical-align: top;

  background-color: var(--color-background-card);
  border-color: var(--color-border);
  color: var(--color-text);

  border-radius: 6px;
  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.1);
  width: 100%;
  transition: 0.2s;
  transition-property: border-color, box-shadow;
  z-index: 1;
  ${(p) => p.isDanger && `border-color: var(--color-danger);`}
`

type BaseInputProps = React.ComponentProps<"input"> & {
  className?: string
  error?: boolean
  type?: React.HTMLInputTypeAttribute
  disabled?: boolean
  value?: string
  defaultValue?: string
  required?: boolean
  autoCorrect?: "false"
  autoComplete?: "false"
  autoCapitalize?: "false"
  spellCheck?: "false"
  name?: string
  id?: string
  placeholder?: string
  autoFocus?: boolean
  readOnly?: boolean
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFocus?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  ref?:
    | ((instance: HTMLInputElement | null) => void)
    | React.RefObject<HTMLInputElement>
    | null
    | undefined
}

const BaseInput = React.forwardRef(
  (
    { className, error = false, ...props }: BaseInputProps,
    ref: BaseInputProps["ref"],
  ) => {
    return (
      <StyledInput
        className={
          className + " " + "placeholder:text-[var(--color-input-placeholder)]"
        }
        isDanger={error}
        {...props}
        ref={ref}
      />
    )
  },
)

const createInput = (
  type: React.InputHTMLAttributes<HTMLInputElement>["type"],
) =>
  React.forwardRef(
    (props: Omit<BaseInputProps, "type">, ref: BaseInputProps["ref"]) => (
      <BaseInput {...props} type={type} ref={ref} />
    ),
  )

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
  id?: string
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

export const Textarea = styled(TextareaAutosize).attrs({
  className: "placeholder:text-[var(--color-input-placeholder)]",
})<{
  isError?: boolean
  bottomFlat?: boolean
  minimized?: boolean
}>`
  -moz-appearance: none;
  -webkit-appearance: none;
  align-items: center;
  border: 1px solid transparent;
  box-shadow: none;
  font-size: 1rem;
  justify-content: flex-start;
  padding-bottom: 5px;
  padding-top: 5px;
  padding-left: 6px;
  padding-right: 6px;
  position: relative;
  border-radius: 6px;

  background-color: var(--color-background-card);
  border-color: var(--color-border);
  color: var(--color-text);

  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.1);
  width: 100%;
  transition: 0.2s;
  transition-property: border-color, box-shadow;
  z-index: 1;

  ${(p) => p.isError && `border-color: var(--color-danger);`}

  display: block;
  padding: 0.75rem;
  border-radius: 6px;
  ${(p) =>
    !p.minimized &&
    `
    line-height: 1.5;
    min-height: 120px;
    max-height: 600px;
    `}

  max-width: 100%;
  min-width: 100%;
  resize: vertical;

  ${(p) =>
    p.bottomFlat &&
    `border-bottom-left-radius: unset;
    border-bottom-right-radius: unset;`}
`
