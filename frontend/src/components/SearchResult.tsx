import { Hit } from "instantsearch.js"
import { useInstantSearch } from "react-instantsearch"
import { Link } from "react-router-dom"

import { clx } from "@/classnames"
import { CustomHighlight } from "@/components/CustomHighlight"
import { pathRecipeDetail, pathRecipesList } from "@/paths"
import { toURL } from "@/urls"

const stylesSuggestion = "p-1 overflow-x-hidden whitespace-nowrap text-ellipsis"

const styleSuggestionInfo = clx(
  "text-center text-[var(--color-text-muted)]",
  stylesSuggestion,
)

export function SearchResult({
  hits,
  onClick,
}: {
  onClick?: () => void
  hits: Array<
    Hit<{
      readonly id: number
      readonly name: string
      readonly archived_at: string | null
      readonly author: string | null
    }>
  >
}) {
  const { indexUiState } = useInstantSearch()
  const suggestions = hits
    .map((hit, index) => {
      return (
        <Link
          key={hit.id}
          to={
            pathRecipeDetail({ recipeId: hit.id.toString() }) +
            "-" +
            toURL(hit.name)
          }
          className={clx(
            stylesSuggestion,
            index === 0 && "underline",
            hit.archived_at != null &&
              "text-[var(--color-text-muted)] line-through",
          )}
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
          matches: {hits.length}
        </span>

        <Link
          to={{
            pathname: pathRecipesList({}),
            search: `search=${encodeURIComponent(indexUiState.query ?? "")}`,
          }}
          data-testid="search browse"
        >
          Browse
        </Link>
      </div>
    </div>
  )
}
