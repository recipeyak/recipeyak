import { useRef, useState } from "react"
import useOnClickOutside from "use-onclickoutside"

import { clx } from "@/classnames"
import { Button } from "@/components/Buttons"
import { SearchIcon, SearchPalette } from "@/components/SearchPalette"
import { isInputFocused } from "@/input"
import { useGlobalEvent } from "@/useGlobalEvent"

export function NavRecipeSearch() {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  // If a user clicks outside of the dropdown, we want to hide the dropdown, but
  // keep their search query.
  //
  // The alternative would be to clear the search query when clicking outside,
  // but I'm not sure that's desirable.
  const [showPopover, setShowPopover] = useState(false)
  const searchInputRef = useRef<HTMLButtonElement>(null)

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

  const resetForm = () => {
    setQuery("")
    setSelectedIndex(0)
    setShowPopover(false)
  }

  return (
    <div ref={searchContainerRef} className="flex sm:w-full">
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
            <SearchIcon />
            <div className="block sm:hidden">Search</div>
            <span className="hidden sm:block">Press / to search</span>
          </>
        }
        variant="nostyle"
        className={clx(
          "relative inline-flex w-full !cursor-default select-none items-center !justify-start gap-2 whitespace-nowrap rounded-md border border-solid border-[--color-border] bg-[--color-background-card] px-2 py-[5px] !pr-3 text-center align-top text-base font-normal leading-[1.5] text-[--color-text] no-underline outline-none -outline-offset-1 transition-[border-color,background-color] duration-75 focus-within:outline focus-within:outline-[2px] focus-within:outline-[rgb(47,129,247)] disabled:cursor-default print:!hidden sm:!cursor-text",
        )}
      />
      {showPopover && (
        <SearchPalette
          selectedIndex={selectedIndex}
          query={query}
          setSelectedIndex={setSelectedIndex}
          setQuery={(query) => {
            setQuery(query)
            // If we start searching after we already selected a
            // suggestion, we should reset back to the initial state aka 0
            if (selectedIndex !== 0) {
              setSelectedIndex(0)
            }
          }}
          onClose={() => {
            resetForm()
          }}
          searchInputRef={searchInputRef}
        />
      )}
    </div>
  )
}
