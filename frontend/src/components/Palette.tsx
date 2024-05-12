import { forwardRef } from "react"

import { clx } from "@/classnames"
import { SearchInput } from "@/components/SearchInput"

const stylesSuggestion =
  "px-2 py-2 overflow-x-hidden whitespace-nowrap text-ellipsis"

const styleSuggestionInfo = clx(
  "text-center text-[--color-text-muted]",
  stylesSuggestion,
)

export const Palette = forwardRef(
  (
    {
      suggestions,
      footer,
      value,
      icon,
      onChange,
      onKeyDown,
    }: {
      icon: React.ReactNode
      suggestions: React.ReactNode[]
      footer?: React.ReactNode
      value: string
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
    },
    ref: React.ForwardedRef<HTMLDivElement>,
  ) => {
    return (
      <div
        className="pointer-events-none fixed inset-x-0 top-[2px] z-[1000] flex w-full justify-center"
        ref={ref}
      >
        <div className="pointer-events-auto flex w-full flex-col gap-2 rounded-xl border border-solid border-[--color-border] bg-[--color-background-card] px-2 pb-1 pt-3 sm:inset-x-[unset] sm:max-w-[600px]">
          <div
            className={clx(
              "z-[1] flex w-full items-center justify-start gap-1 rounded-md  bg-[--color-background-card] pl-1",
            )}
            onClick={(e) => {
              // Allow clicking on the input -- it shouldn't close the modal
              e.stopPropagation()
            }}
          >
            {icon}
            <SearchInput
              value={value}
              autoFocus
              className="w-full border-none bg-transparent py-[5px] pr-2 text-base text-[--color-text] outline-none placeholder:text-[--color-input-placeholder]"
              placeholder=""
              onChange={(e) => {
                onChange(e)
              }}
              onKeyDown={onKeyDown}
            />
          </div>
          <hr className="m-0" />
          {suggestions.length === 0 && (
            <div className={clx(styleSuggestionInfo, "pt-2")}>
              No Results Found
            </div>
          )}
          <div className="mb-1 flex w-full flex-col gap-1">{suggestions}</div>
          {footer}
        </div>
      </div>
    )
  },
)
