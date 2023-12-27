import { Link } from "react-router-dom"

import { clx } from "@/classnames"
import { Tag } from "@/components/Tag"
import { pathRecipeDetail, pathRecipesList } from "@/paths"
import { RecipeListItem } from "@/queries/recipeList"
import { searchClickCreate } from "@/queries/searchClickCreate"
import { Match } from "@/search"

const stylesSuggestion = "p-1 overflow-x-hidden whitespace-nowrap text-ellipsis"

const styleSuggestionInfo = clx(
  "text-center text-[var(--color-text-muted)]",
  stylesSuggestion,
)

export function SearchResult({
  isLoading,
  searchResults,
  searchQuery,
  onClick,
}: {
  searchQuery: string
  isLoading: boolean
  onClick?: () => void
  searchResults: {
    readonly recipe: RecipeListItem
    readonly match: Match[]
  }[]
}) {
  const suggestions = searchResults
    .map((result, index) => {
      const { recipe, match: matches } = result

      const nameMatch = matches.find((x) => x.kind === "name")
      const ingredientMatch = matches.find((x) => x.kind === "ingredient")
      const tagMatch = matches.find((x) => x.kind === "tag")
      const authorMatch = matches.find((x) => x.kind === "author")

      return (
        <Link
          key={recipe.id}
          onClick={() => {
            void searchClickCreate({ matches, query: searchQuery, recipe })
          }}
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
                nameMatch != null && "font-bold",
              )}
            >
              {recipe.name}{" "}
            </span>
            {recipe.author && (
              <span className="grow">
                by{" "}
                <span className={clx(authorMatch != null && "font-bold")}>
                  {recipe.author}
                </span>
              </span>
            )}
          </div>
          {ingredientMatch != null ? (
            <div className="ml-4 font-bold">{ingredientMatch.value}</div>
          ) : null}
          {tagMatch != null ? <Tag>{tagMatch.value}</Tag> : null}
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
                search: `search=${encodeURIComponent(searchQuery)}`,
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
