import { clamp } from "lodash-es"
import { useRef } from "react"
import { useFocusVisible } from "react-aria"
import { Link, useHistory } from "react-router-dom"
import useOnClickOutside from "use-onclickoutside"

import { isMobile } from "@/browser"
import { clx } from "@/classnames"
import { CustomHighlight } from "@/components/CustomHighlight"
import { Image } from "@/components/Image"
import { Palette } from "@/components/Palette"
import { pathRecipesList } from "@/paths"
import { ResponseFromUse } from "@/queries/useQueryUtilTypes"
import { useRecentlyViewedRecipesList } from "@/queries/useRecentlyViewedRecipesList"
import { useSearchRecipes } from "@/queries/useSearchRecipes"
import { recipeURL } from "@/urls"

const stylesSuggestion =
  "px-1 py-[0.125rem] overflow-x-hidden whitespace-nowrap text-ellipsis"

type Hits = NonNullable<ResponseFromUse<typeof useSearchRecipes>>["hits"]

export function SearchIcon({
  className,
  size = 16,
}: {
  className?: string
  size?: number
}) {
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

function useSearchResults(query: string) {
  const results = useSearchRecipes({ query, limit: 6 })
  const recentlyViewedRecipes = useRecentlyViewedRecipesList()
  const recentlyViewedRecipeHits: Hits =
    recentlyViewedRecipes.data?.map((x) => ({
      archived_at: x.archivedAt,
      author: x.author,
      id: x.id,
      ingredients: [],
      name: x.name,
      objectID: x.id.toString(),
      primary_image: x.primaryImage
        ? {
            background_url: x.primaryImage.backgroundUrl,
            url: x.primaryImage.url,
          }
        : null,
      favorite_by_user_id: [],
    })) ?? []

  const hitCount = !query
    ? recentlyViewedRecipeHits.length
    : results.data?.result.nbHits ?? 0

  // Show recently viewed recipes when there's no search query.
  const hits = !query ? recentlyViewedRecipeHits : results.data?.hits ?? []

  return [hits, hitCount] as const
}

export function SearchPalette({
  query,
  setQuery,
  selectedIndex,
  onClose,
  setSelectedIndex,
  triggerRef,
}: {
  query: string
  setQuery: (_: string) => void
  selectedIndex: number
  onClose: () => void
  setSelectedIndex: (_: (_: number) => number) => void
  triggerRef: React.RefObject<HTMLButtonElement>
}) {
  const [hits, hitCount] = useSearchResults(query)

  // Used to avoid showing focus ring on mobile (devices without keyboards)
  const { isFocusVisible } = useFocusVisible({
    autoFocus: true,
  })
  const paletteRef = useRef(null)
  useOnClickOutside(paletteRef, (event) => {
    // Avoid immediately closing search palette on open.
    //
    // https://github.com/Andarist/use-onclickoutside/issues/9#issuecomment-549612836
    if (
      event.target &&
      // @ts-expect-error ts(2345): Argument of type 'EventTarget' is not assignable to parameter of type 'Node'.
      !triggerRef.current?.contains(event.target)
    ) {
      onClose()
    }
  })

  const history = useHistory()
  const handleSearchKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // We need to extract the key from the synthetic event before we lose the
    // event.
    switch (e.key) {
      case "Escape": {
        // end up with the trigger button focused when a user hits
        // escape so they can press enter to open the modal again
        onClose()
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
        const suggestion = hits?.[selectedIndex]
        if (suggestion) {
          history.push(recipeURL(suggestion.id, suggestion.name))
        }
        onClose()
        break
      }
    }
  }

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
            "rounded-md bg-[--color-border-selected-day]",
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
            size="small"
            grayscale={hit.archived_at != null}
            sources={
              hit.primary_image && {
                url: hit.primary_image.url,
                backgroundUrl: hit.primary_image.background_url,
              }
            }
            rounded
          />
          <div className="flex flex-col overflow-x-hidden text-ellipsis whitespace-pre">
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
    <Palette
      ref={paletteRef}
      icon={<SearchIcon />}
      value={query}
      onChange={(e) => {
        setQuery(e.target.value)
      }}
      onKeyDown={handleSearchKeydown}
      suggestions={suggestions}
      footer={
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
      }
    />
  )
}
