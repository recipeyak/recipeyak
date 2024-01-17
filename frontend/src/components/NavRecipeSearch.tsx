import { clamp } from "lodash-es"
import React, { useRef, useState } from "react"
import { Link, useHistory } from "react-router-dom"
import useOnClickOutside from "use-onclickoutside"

import { isMobile } from "@/browser"
import { clx } from "@/classnames"
import { Button } from "@/components/Buttons"
import { CustomHighlight } from "@/components/CustomHighlight"
import { SearchInput } from "@/components/Forms"
import { Image } from "@/components/Image"
import { pathRecipesList } from "@/paths"
import { ResponseFromUse } from "@/queries/queryUtilTypes"
import { useSearchRecipes } from "@/queries/searchRecipes"
import { imgixFmtSmall } from "@/url"
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
  const suggestions = hits.map((hit, index) => {
    const isFocusVisible = index === selectedIndex
    return (
      <Link
        key={hit.id}
        to={recipeURL(hit.id, hit.name)}
        className={clx(
          stylesSuggestion,
          isFocusVisible &&
            !isMobile() &&
            "rounded-md outline outline-[3px] outline-[rgb(47,129,247)]",
          hit.archived_at != null && "text-[--color-text-muted] line-through",
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
            sources={
              hit.primary_image && {
                url: imgixFmtSmall(hit.primary_image.url),
                backgroundUrl: hit.primary_image.background_url,
              }
            }
            rounded
          />
          <div className="flex flex-col">
            <div
              className={clx(
                "grow-0 overflow-x-hidden text-ellipsis whitespace-pre",
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
    <div className="absolute inset-x-0 top-[2px] z-10 flex w-full justify-center">
      <div
        onClick={onClick}
        className="flex w-full flex-col gap-2 rounded-xl border border-solid border-[--color-border] bg-[--color-background-card] px-3 pb-1 pt-3 sm:inset-x-[unset] sm:max-w-[600px]"
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
    (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")
  )
}

function SearchIcon({ className }: { className: string }) {
  const size = 16
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
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
        setSelectedIndex((s) => clamp(s - 1, 0, hits.length - 1))
        break
      case "ArrowDown":
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
        // more closely mimic the behavior of the search input vs onPress/onClick
        onPressStart={() => {
          setShowPopover(true)
        }}
        children={
          <>
            <SearchIcon className="block sm:hidden" />
            <span className="hidden sm:block">Press / to search</span>
          </>
        }
        variant="nostyle"
        className={
          "w-full !cursor-default !justify-start border border-solid border-[--color-border] bg-[--color-background-card] !px-2 !py-[5px] !text-base !font-normal text-[--color-text] sm:!cursor-text"
        }
      />
      {showPopover && (
        <SearchResultsPopover
          hits={hits}
          hitCount={results.data?.result.nbHits ?? 0}
          selectedIndex={selectedIndex}
          query={query}
          searchInput={
            <SearchInput
              value={query}
              autoFocus
              placeholder="Press / to search"
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
          }
          onClick={() => {
            resetForm()
          }}
        />
      )}
    </div>
  )
}
