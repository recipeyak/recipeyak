import React, { useEffect, useState } from "react"
import { useHistory } from "react-router"

import { ITeam } from "@/api"
import cls from "@/classnames"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { CheckBox, TextInput } from "@/components/Forms"
import { Loader } from "@/components/Loader"
import RecipeItem from "@/pages/recipe-list/RecipeItem"
import { parseIntOrNull } from "@/parseIntOrNull"
import { useRecipeList } from "@/queries/recipeList"
import { searchRecipes } from "@/search"
import { setQueryParams } from "@/utils/querystring"

interface IResultsProps {
  readonly recipes: JSX.Element[]
  readonly query: string
}

function Results({ recipes, query }: IResultsProps) {
  if (recipes.length === 0 && query !== "") {
    return <NoMatchingRecipe query={query} />
  }
  return <>{recipes}</>
}

function AddRecipeCallToAction() {
  return (
    <Box dir="col" mx="auto" mt={2} align="center" gap={1}>
      <div>No recipes here.</div>
      <Button variant="primary" size="small" to="/recipes/add">
        Add a Recipe
      </Button>
    </Box>
  )
}

function NoMatchingRecipe({ query }: { readonly query: string }) {
  return (
    <p className="grid-entire-row justify-center break-word">
      No recipes found matching <strong>{query}</strong>
    </p>
  )
}

interface IRecipeList {
  readonly query: string
  readonly drag?: boolean
  readonly scroll?: boolean
}

function RecipeList(props: IRecipeList) {
  const [showArchived, setShowArchived] = useState(false)

  const recipes = useRecipeList()

  if (!recipes.isSuccess) {
    return <Loader />
  }

  const results = searchRecipes({
    recipes: recipes.data,
    query: props.query,
    includeArchived: true,
  })

  const normalResults = results.recipes
    .filter((result) => !result.recipe.archived_at)
    .map((result) => (
      <RecipeItem
        {...result.recipe}
        match={result.match}
        drag={props.drag}
        key={result.recipe.id}
      />
    ))
  const archivedResults = results.recipes
    .filter((result) => result.recipe.archived_at)
    .map((result) => (
      <RecipeItem
        {...result.recipe}
        match={result.match}
        drag={props.drag}
        key={result.recipe.id}
      />
    ))

  const scrollClass = props.scroll ? "recipe-scroll" : ""

  if (results.recipes.length === 0 && props.query === "") {
    return <AddRecipeCallToAction />
  }

  return (
    <div className={scrollClass}>
      <div className="mb-2 d-flex justify-space-between flex-wrap">
        <div className="fs-14px mr-2">
          results: {normalResults.length + archivedResults.length}{" "}
          {archivedResults.length > 0 && (
            <>({archivedResults.length} archived)</>
          )}
        </div>
        <div className="fs-14px">
          <span>show all: </span>{" "}
          <CheckBox
            onChange={() => {
              setShowArchived((s) => !s)
            }}
            checked={showArchived}
            name="optional"
            className="mr-2"
          />
        </div>
      </div>
      <div className="recipe-grid">
        <Results recipes={normalResults} query={props.query} />
      </div>
      {archivedResults.length > 0 && showArchived ? (
        <>
          <div className="d-flex align-items-center">
            <hr className="flex-grow-1" />
            <b className="mx-4 my-4">Archived Recipes</b>
            <hr className="flex-grow-1" />
          </div>
          <div className="recipe-grid">
            <Results recipes={archivedResults} query={props.query} />
          </div>
        </>
      ) : null}
    </div>
  )
}

function getSearch(qs: string): string {
  const params = new URLSearchParams(qs)
  const searchQuery = params.get("search")
  if (searchQuery != null && typeof searchQuery === "string") {
    return decodeURIComponent(searchQuery)
  }
  const tagParam = params.get("tag")
  if (typeof tagParam === "string") {
    return `tag:${tagParam}`
  }
  const recipeIdParam = params.get("recipeId")
  if (recipeIdParam == null || Array.isArray(recipeIdParam)) {
    return ""
  }
  const recipeId = parseIntOrNull(recipeIdParam)
  if (recipeId == null) {
    return ""
  }
  return `recipeId:${recipeId}`
}

// TODO(sbdchd): this really shouldn't be shared like it is
function RecipesListSearch({
  noPadding,
  drag,
  scroll,
}: {
  readonly scroll?: boolean
  readonly drag?: boolean
  readonly noPadding?: boolean
  readonly teamID?: ITeam["id"] | null
}) {
  const [query, setQuery] = useState(() => getSearch(window.location.search))
  const history = useHistory()

  useEffect(() => {
    setQueryParams(history, { search: query })
  }, [query, history])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  return (
    <div className={cls(noPadding ? "" : "mw-1000px ml-auto mr-auto")}>
      <TextInput
        value={query}
        className={cls(noPadding ? "" : "mb-2")}
        onChange={handleQueryChange}
        placeholder="search • optionally prepended a tag, 'author:' 'name:' 'ingredient:"
      />
      <RecipeList query={query} drag={drag} scroll={scroll} />
    </div>
  )
}

export default RecipesListSearch
