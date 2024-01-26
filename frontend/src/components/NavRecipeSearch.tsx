import { clamp } from "lodash-es"
import React, { useRef, useState } from "react"
import { useFocusVisible } from "react-aria"
import { Link, useHistory } from "react-router-dom"
import useOnClickOutside from "use-onclickoutside"

import { isMobile } from "@/browser"
import { clx } from "@/classnames"
import { Button } from "@/components/Buttons"
import { CustomHighlight } from "@/components/CustomHighlight"
import { Image } from "@/components/Image"
import { pathRecipesList } from "@/paths"
import { ResponseFromUse } from "@/queries/queryUtilTypes"
import { useSearchRecipes } from "@/queries/searchRecipes"
import { recipeURL } from "@/urls"
import { useGlobalEvent } from "@/useGlobalEvent"

const stylesSuggestion =
  "px-1 overflow-x-hidden whitespace-nowrap text-ellipsis"

const styleSuggestionInfo = clx(
  "text-center text-[--color-text-muted]",
  stylesSuggestion,
)

type Hits = NonNullable<ResponseFromUse<typeof useSearchRecipes>>["hits"]

function SearchResultsPopover({
  query,
  hits,
  hitCount,
  onClick,
  searchInput,
  selectedIndex,
}: {
  query: string
  searchInput: React.ReactNode
  onClick?: () => void
  hitCount: number
  selectedIndex: number
  hits: Hits
}) {
  // Used to avoid showing focus ring on mobile (devices without keyboards)
  const { isFocusVisible } = useFocusVisible({
    autoFocus: true,
  })

  const suggestions = hits.map((hit, index) => {
    const isCurrentSelection = index === selectedIndex && isFocusVisible
    return (
      <Link
        key={hit.id}
        to={recipeURL(hit.id, hit.name)}
        className={clx(
          stylesSuggestion,
          isCurrentSelection &&
            !isMobile() &&
            "rounded-md outline outline-[3px] outline-[rgb(47,129,247)]",
        )}
        onDragStart={(e) => {
          e.dataTransfer.setData("recipeyak/recipe", JSON.stringify(hit))
          e.dataTransfer.effectAllowed = "copyMove"
        }}
      >
        <div className="flex items-center gap-2">
          <Image
            width={40}
            height={40}
            imgixFmt="small"
            grayscale={hit.archived_at != null}
            sources={
              hit.primary_image && {
                url: hit.primary_image.url,
                backgroundUrl: hit.primary_image.background_url,
              }
            }
            rounded
          />
          <div className="flex flex-col">
            <div
              className={clx(
                "grow-0 overflow-x-hidden text-ellipsis whitespace-pre",
                hit.archived_at != null && "line-through",
              )}
            >
              <CustomHighlight hit={hit} attribute="name" />{" "}
            </div>
            {hit.author && (
              <div className="grow text-sm">
                <CustomHighlight hit={hit} attribute="author" />
              </div>
            )}
          </div>
        </div>
      </Link>
    )
  })
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[2px] z-10 flex w-full justify-center">
      <div
        onClick={onClick}
        className="pointer-events-auto flex w-full flex-col gap-2 rounded-xl border border-solid border-[--color-border] bg-[--color-background-card] px-3 pb-1 pt-3 sm:inset-x-[unset] sm:max-w-[600px]"
      >
        {searchInput}
        {hits.length === 0 && (
          <div className={clx(styleSuggestionInfo, "pt-2")}>
            No Results Found
          </div>
        )}
        <div className="flex w-full flex-col gap-1">{suggestions}</div>
        <div
          className={clx(
            "flex justify-between border-[0] border-t border-solid border-[--color-border] py-1",
            stylesSuggestion,
          )}
        >
          <span className="text-[--color-text-muted]">results: {hitCount}</span>
          <Link
            to={{
              pathname: pathRecipesList({}),
              search: `search=${encodeURIComponent(query ?? "")}`,
            }}
            data-testid="search browse"
          >
            Browse
          </Link>
        </div>
      </div>
    </div>
  )
}

function isInputFocused() {
  const activeElement = document.activeElement
  return (
    activeElement !== document.body &&
    activeElement !== null &&
    ((activeElement.tagName === "INPUT" &&
      activeElement.getAttribute("type") !== "button") ||
      activeElement.tagName === "TEXTAREA")
  )
}

function SearchIcon({ className }: { className?: string }) {
  const size = 16
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

export function NavRecipeSearch() {
  const history = useHistory()

  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  const results = useSearchRecipes({ query, limit: 7 })

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
      if (
        (e.key === "k" && e.metaKey) ||
        (e.key === "/" && !isInputFocused())
      ) {
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

  const hits = results.data?.hits ?? []

  const handleSearchKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // We need to extract the key from the synthetic event before we lose the
    // event.
    switch (e.key) {
      case "Escape": {
        // end up with the trigger button focused when a user hits
        // escape so they can press enter to open the modal again
        setShowPopover(false)
        searchInputRef.current?.focus()
        break
      }
      case "ArrowUp":
        // prevent arrow key from moving cursor to start of input
        e.preventDefault()
        setSelectedIndex((s) => clamp(s - 1, 0, hits.length - 1))
        break
      case "ArrowDown":
        // prevent arrow key from moving cursor to end of input
        e.preventDefault()
        setSelectedIndex((s) => clamp(s + 1, 0, hits.length - 1))
        break
      case "Enter": {
        const suggestion = results.data?.hits?.[selectedIndex]
        if (suggestion) {
          history.push(recipeURL(suggestion.id, suggestion.name))
        }
        resetForm()
        break
      }
    }
  }

  return (
    <div ref={searchContainerRef} className="flex sm:w-full">
      <Button
        ref={searchInputRef}
        onKeyDown={(e) => {
          if (e.key === "/" || (e.key === "k" && e.metaKey)) {
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
            e.key === "Delete" ||
            e.key === "Backspace" ||
            e.key === "CapsLock"
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
        <SearchResultsPopover
          hits={hits}
          hitCount={results.data?.result.nbHits ?? 0}
          selectedIndex={selectedIndex}
          query={query}
          searchInput={
            <div
              className={clx(
                "relative z-[1] flex w-full appearance-none items-center justify-start gap-2 rounded-md border border-solid border-[--color-border] bg-[--color-background-card] pl-2 align-top shadow-none transition-[border-color,box-shadow] duration-200 [box-shadow:inset_0_1px_2px_rgba(10,10,10,0.1)]",
                "-outline-offset-1 focus-within:outline focus-within:outline-[2px] focus-within:outline-[rgb(47,129,247)]",
              )}
              onClick={(e) => {
                // Allow clicking on the input -- it shouldn't close the modal
                e.stopPropagation()
              }}
            >
              <SearchIcon />
              <input
                value={query}
                type="search"
                autoComplete="off"
                spellCheck="false"
                autoFocus
                className="w-full border-none bg-transparent py-[5px] pr-2 text-base text-[--color-text] outline-none placeholder:text-[--color-input-placeholder]"
                placeholder=""
                onChange={(e) => {
                  setQuery(e.target.value)
                  // If we start searching after we already selected a
                  // suggestion, we should reset back to the initial state aka 0
                  if (selectedIndex !== 0) {
                    setSelectedIndex(0)
                  }
                }}
                onKeyDown={handleSearchKeydown}
              />
            </div>
          }
          onClick={() => {
            resetForm()
          }}
        />
      )}
    </div>
  )
}
