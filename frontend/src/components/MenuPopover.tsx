import { Popover as AriaPopover } from "react-aria-components"

export function MenuPopover({ children }: { children: React.ReactNode }) {
  return (
    <AriaPopover className="w-56 origin-top-left overflow-auto rounded-md border border-solid border-[--color-border] bg-[--color-background-calendar-day] p-2 shadow-lg outline-none">
      {children}
    </AriaPopover>
  )
}
