import React from "react"
import { Link, useHistory } from "react-router-dom"
import useOnClickOutside from "use-onclickoutside"

import { clx } from "@/classnames"
import { CustomHighlight } from "@/components/CustomHighlight"
import { SearchInput } from "@/components/Forms"
import { pathRecipesList } from "@/paths"
import { ResponseFromUse } from "@/queries/queryUtilTypes"
import { useSearchRecipes } from "@/queries/searchRecipes"
import { recipeURL } from "@/urls"
import { useGlobalEvent } from "@/useGlobalEvent"

const stylesSuggestion = "p-1 overflow-x-hidden whitespace-nowrap text-ellipsis"

const styleSuggestionInfo = clx(
  "text-center text-[var(--color-text-muted)]",
  stylesSuggestion,
)

type Hits = NonNullable<ResponseFromUse<typeof useSearchRecipes>>["hits"]
function SearchResult({
  query,
  hits,
  hitCount,
  onClick,
}: {
  query: string
  onClick?: () => void
  hitCount: number
  hits: Hits
}) {
  const suggestions = hits
    .map((hit, index) => {
      return (
        <Link
          key={hit.id}
          to={recipeURL(hit.id, hit.name)}
          className={clx(
            stylesSuggestion,
            index === 0 && "underline",
            hit.archived_at != null &&
              "text-[var(--color-text-muted)] line-through",
          )}
          onDragStart={(e) => {
            e.dataTransfer.setData("recipeyak/recipe", JSON.stringify(hit))
          }}
        >
          <div className="flex">
            <span
              className={clx(
                "grow-0 overflow-x-hidden text-ellipsis whitespace-pre",
              )}
            >
              <CustomHighlight hit={hit} attribute="name" />{" "}
            </span>
            {hit.author && (
              <span className="grow">
                by{" "}
                <span>
                  <CustomHighlight hit={hit} attribute="author" />
                </span>
              </span>
            )}
          </div>
        </Link>
      )
    })
    .slice(0, 7)
  return (
    <div
      onClick={onClick}
      className="inline-grid w-full rounded-[5px] border border-solid border-[var(--color-border)] bg-[var(--color-background-card)] p-1"
    >
      {hits.length === 0 && (
        <div className={styleSuggestionInfo}>No Results Found</div>
      )}
      {suggestions}
      <div
        className={clx(
          "mt-2 flex justify-between border-[0] border-t border-solid border-[var(--color-border)]",
          stylesSuggestion,
        )}
      >
        <span className="text-[var(--color-text-muted)]">
          matches: {hitCount}
        </span>

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

export function NavRecipeSearch() {
  const history = useHistory()

  const [query, setQuery] = React.useState("")

  const results = useSearchRecipes({ query })

  // If a user clicks outside of the dropdown, we want to hide the dropdown, but
  // keep their search query.
  //
  // The alternative would be to clear the search query when clicking outside,
  // but I'm not sure that's desirable.
  const [isClosed, setIsClosed] = React.useState(false)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const ref = React.useRef(null)
  useOnClickOutside(ref, () => {
    setIsClosed(true)
  })

  useGlobalEvent({
    keyDown(e) {
      if (
        (e.key === "k" && e.metaKey) ||
        (e.key === "/" && !isInputFocused())
      ) {
        searchInputRef.current?.focus()
        e.preventDefault()
      }
    },
  })

  const resetForm = () => {
    setQuery("")
    setIsClosed(false)
  }

  const handleSearchKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // We need to extract the key from the synthetic event before we lose the
    // event.
    const key = e.key

    const suggestion = results.data?.hits?.[0]
    if (!suggestion) {
      return
    }
    if (key === "Enter") {
      resetForm()
      history.push(recipeURL(suggestion.id, suggestion.name))
    }
  }

  return (
    <div ref={ref} className="flex w-full">
      <SearchInput
        ref={searchInputRef}
        value={query}
        placeholder="Press / to search"
        onChange={(e) => {
          setQuery(e.target.value)
        }}
        onKeyDown={handleSearchKeydown}
        onFocus={() => {
          setIsClosed(false)
        }}
      />
      {query && !isClosed && (
        <div className="absolute inset-x-0 top-[60px] z-10 w-full sm:inset-x-[unset] sm:max-w-[400px]">
          <SearchResult
            hits={results.data?.hits ?? []}
            hitCount={results.data?.result.nbHits ?? 0}
            query={query}
            onClick={() => {
              resetForm()
            }}
          />
        </div>
      )}
    </div>
  )
}
