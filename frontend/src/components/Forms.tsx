import * as React from "react"
// eslint-disable-next-line no-restricted-imports
import TextareaAutosize from "react-textarea-autosize"

import { clx } from "@/classnames"

interface IFormErrorHandlerProps {
  readonly error: string[] | null | undefined
}

export const FormErrorHandler = ({ error }: IFormErrorHandlerProps) => {
  if (!error) {
    return null
  }
  return (
    <div className="mt-1 block text-xs text-[--color-danger]">
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
      <input
        className={clx(
          "relative z-[1] w-full appearance-none items-center justify-start rounded-md border border-solid border-[--color-border] bg-[--color-background-card] px-[6px] py-[5px] align-top text-base text-[--color-text] shadow-none transition-[border-color,box-shadow] duration-200 [box-shadow:inset_0_1px_2px_rgba(10,10,10,0.1)] placeholder:text-[--color-input-placeholder]",
          error && "border-[--color-danger]",
          className,
        )}
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

export function Select(props: {
  id?: string
  value: number | string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  disabled?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="relative inline-block h-[2.25em] max-w-full rounded-md align-top text-xs after:pointer-events-none after:absolute after:right-[1.125em] after:top-[50%] after:z-[4] after:mt-[-0.375em] after:block after:h-[0.5em] after:w-[0.5em] after:-rotate-45 after:border after:border-r-0 after:border-t-0 after:border-solid after:border-[--color-accent] after:content-['_']">
      {/* eslint-disable-next-line react/forbid-elements */}
      <select
        {...props}
        className="relative block h-[2.25em] max-w-full cursor-pointer appearance-none items-center justify-start rounded-md border border-solid border-[--color-border] bg-[--color-background-card] px-[calc(0.625em-1px)] py-[calc(0.375em-1px)] pr-[2.5em] align-top text-xs font-semibold leading-[1.5] text-[--color-text] shadow-none hover:border-[--color-border] focus:border-[--color-border] active:border-[--color-border]"
      />
    </div>
  )
}

export function Textarea({
  isError,
  minimized,
  bottomFlat,
  ...props
}: Omit<React.ComponentProps<typeof TextareaAutosize>, "className" | "ref"> & {
  isError?: boolean
  minimized?: boolean
  bottomFlat?: boolean
}) {
  return (
    <TextareaAutosize
      {...props}
      className={clx(
        "relative z-[1] block w-full min-w-full max-w-full resize-y appearance-none items-center justify-start rounded-md border border-solid border-[--color-border] bg-[--color-background-card] px-3 py-2 text-base text-[--color-text] shadow-none transition-[border-color,box-shadow] duration-200 [box-shadow:inset_0_1px_2px_rgba(10,10,10,0.1)] placeholder:text-[--color-input-placeholder]",
        isError && "border-[--color-danger]",
        !minimized && "max-h-[600px] min-h-[120px] leading-[1.5]",
        bottomFlat && "rounded-b-[unset]",
      )}
    />
  )
}
