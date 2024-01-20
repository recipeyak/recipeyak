import * as React from "react"

export function Select(props: {
  id?: string
  value: number | string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  disabled?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="relative inline-block h-[2.25em] max-w-max rounded-md align-top text-xs after:pointer-events-none after:absolute after:right-[1.125em] after:top-[50%] after:z-[4] after:mt-[-0.375em] after:block after:h-[0.5em] after:w-[0.5em] after:-rotate-45 after:border after:border-r-0 after:border-t-0 after:border-solid after:border-[--color-accent] after:content-['_']">
      {/* eslint-disable-next-line react/forbid-elements */}
      <select
        {...props}
        className="relative block h-[2.25em] max-w-full cursor-pointer appearance-none items-center justify-start rounded-md border border-solid border-[--color-border] bg-[--color-background-card] px-[calc(0.625em-1px)] py-[calc(0.375em-1px)] pr-[2.5em] align-top text-xs font-semibold leading-[1.5] text-[--color-text] shadow-none hover:border-[--color-border] focus:border-[--color-border] active:border-[--color-border]"
      />
    </div>
  )
}
