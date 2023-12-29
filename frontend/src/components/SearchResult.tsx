import { Hit } from "instantsearch.js"
import { useInstantSearch } from "react-instantsearch"
import { Link } from "react-router-dom"

import { clx } from "@/classnames"
import { CustomHighlight } from "@/components/CustomHighlight"
import { pathRecipeDetail, pathRecipesList } from "@/paths"
import { RecipeListItem } from "@/queries/recipeList"

const stylesSuggestion = "p-1 overflow-x-hidden whitespace-nowrap text-ellipsis"

const styleSuggestionInfo = clx(
  "text-center text-[var(--color-text-muted)]",
  stylesSuggestion,
)

export function SearchResult({
  isLoading,
  searchResults,
  onClick,
}: {
  isLoading: boolean
  onClick?: () => void
  searchResults: {
    readonly recipe: RecipeListItem
    readonly hit: Hit
  }[]
}) {
  const { indexUiState } = useInstantSearch()
  const suggestions = searchResults
    .map((result, index) => {
      const { recipe, hit } = result

      return (
        <Link
          key={recipe.id}
          to={pathRecipeDetail({ recipeId: recipe.id.toString() })}
          className={clx(
            stylesSuggestion,
            index === 0 && "underline",
            recipe.archived_at != null && "text-[var(--color-text-muted)]",
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
            {recipe.author && (
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
      {!isLoading ? (
        <>
          {searchResults.length === 0 && (
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
              matches: {searchResults.length}
            </span>

            <Link
              to={{
                pathname: pathRecipesList({}),
                search: `search=${encodeURIComponent(
                  indexUiState.query ?? "",
                )}`,
              }}
              data-testid="search browse"
            >
              Browse
            </Link>
          </div>
        </>
      ) : (
        <div className={styleSuggestionInfo}>Loading...</div>
      )}
    </div>
  )
}
