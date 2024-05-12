import { useRef } from "react"
import useOnClickOutside from "use-onclickoutside"

import { clx } from "@/classnames"
import { Button } from "@/components/Buttons"
import { SearchIcon } from "@/components/SearchPalette"
import { isInputFocused } from "@/input"
import { useGlobalEvent } from "@/useGlobalEvent"
import { useMedia } from "@/useMedia"

export function NavRecipeSearch({
  size,
  setShowPopover,
  searchInputRef,
}: {
  size: number
  setShowPopover: (_: boolean) => void
  searchInputRef: React.RefObject<HTMLButtonElement>
}) {
  const searchContainerRef = useRef(null)
  useOnClickOutside(searchContainerRef, () => {
    setShowPopover(false)
  })

  useGlobalEvent({
    keyDown(e) {
      if (e.key === "/" && !isInputFocused()) {
        e.preventDefault()
        setShowPopover(true)
      }
    },
  })

  const isSmallerOrGreater = useMedia("(min-width: 640px)")

  return (
    <div
      ref={searchContainerRef}
      className="col-start-2 col-end-3 flex sm:w-full"
    >
      <Button
        ref={searchInputRef}
        onKeyDown={(e) => {
          if (e.key === "/") {
            // the other event handler takes care of this
            e.preventDefault()
            setShowPopover(true)
            return
          }
          // Only want to open the search for keys that would result in an input
          // in a search box since we're trying to mimic a <intut type="search"
          // /> with our button.
          // So if someone only presses a modifier, we don't want to open the
          // popover.
          //
          // Not sure this is a complete list.
          if (
            e.key === "Alt" ||
            e.key === "Control" ||
            e.key === "Meta" ||
            e.key === "Shift" ||
            e.key === "Tab" ||
            e.key === "Escape" ||
            e.key === "Delete" ||
            e.key === "Backspace" ||
            e.key === "CapsLock" ||
            // trying to trigger command palette
            (e.key === "k" && e.metaKey)
          ) {
            return
          }
          setShowPopover(true)
        }}
        // more closely mimic the behavior of the search input vs onPress/onClick
        onPressStart={() => {
          setShowPopover(true)
        }}
        children={
          <>
            <SearchIcon size={size} />
            <span className="hidden sm:block">Press / to search</span>
          </>
        }
        variant="nostyle"
        className={clx(
          "relative inline-flex w-full !cursor-pointer select-none items-center !justify-start gap-2 whitespace-nowrap rounded-md text-center align-top text-base font-normal leading-[1.5] text-[--color-text] no-underline outline-none -outline-offset-1 transition-[background-color] duration-75 focus-within:outline focus-within:outline-[2px] focus-within:outline-[rgb(47,129,247)] disabled:cursor-default print:!hidden sm:!cursor-text",
          isSmallerOrGreater
            ? "border border-solid border-[--color-border] bg-[--color-background-card] px-2 py-[5px] !pr-3"
            : "cursor-pointer border-none bg-inherit px-2 py-1",
          "hover:bg-[--color-background-calendar-day] hover:text-[--color-link-hover]",
        )}
      />
    </div>
  )
}
