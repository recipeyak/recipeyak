import queryString from "query-string"
import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import { Link } from "react-router-dom"

import cls from "@/classnames"
import { CheckBox, TextInput } from "@/components/Forms"
import { Loader } from "@/components/Loader"
import RecipeItem from "@/pages/recipe-list/RecipeItem"
import { parseIntOrNull } from "@/parseIntOrNull"
import { searchRecipes } from "@/search"
import { getTeamRecipes, IRecipe } from "@/store/reducers/recipes"
import { ITeam } from "@/store/reducers/teams"
import { IState } from "@/store/store"
import { Dispatch, fetchingRecipeListAsync } from "@/store/thunks"
import { updateQueryParamsAsync } from "@/utils/querystring"
import { isSuccessOrRefetching, WebData } from "@/webdata"

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
    <div className="d-flex">
      <section className="d-flex mx-auto">
        <p className="fs-6 mr-2">No recipes here.</p>

        <Link to="/recipes/add" className="my-button is-primary">
          Add a Recipe
        </Link>
      </section>
    </div>
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
  readonly recipes: WebData<IRecipe[]>
  readonly query: string
  readonly drag?: boolean
  readonly scroll?: boolean
}

function RecipeList(props: IRecipeList) {
  const [showArchived, setShowArchived] = useState(false)
  if (!isSuccessOrRefetching(props.recipes)) {
    return <Loader />
  }

  const results = searchRecipes({
    recipes: props.recipes.data,
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

interface IRecipesProps {
  readonly fetchData: (teamID: number | "personal") => void
  readonly recipes: WebData<IRecipe[]>
  readonly scroll?: boolean
  readonly drag?: boolean
  readonly noPadding?: boolean
  readonly teamID?: ITeam["id"] | "personal" | null
}

function getSearch(qs: string): string {
  const params = queryString.parse(qs)
  const searchQuery = params.search
  if (searchQuery != null && typeof searchQuery === "string") {
    return decodeURIComponent(searchQuery)
  }
  const tagParam = params.tag
  if (typeof tagParam === "string") {
    return `tag:${tagParam}`
  }
  const recipeIdParam = params.recipeId
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
  fetchData,
  noPadding,
  recipes,
  drag,
  scroll,
  teamID,
}: IRecipesProps) {
  const [query, setQuery] = useState(() => getSearch(window.location.search))

  useEffect(() => {
    updateQueryParamsAsync({ search: query })
  }, [query])

  useEffect(() => {
    const teamID_ = teamID == null ? "personal" : teamID
    fetchData(teamID_)
  }, [fetchData, teamID])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  return (
    <div className={cls(noPadding ? "" : "mw-1000px ml-auto mr-auto")}>
      <TextInput
        value={query}
        className={cls("fs-14px", noPadding ? "" : "mb-2")}
        onChange={handleQueryChange}
        placeholder="search • optionally prepended a tag, 'author:' 'name:' 'ingredient:"
      />
      <RecipeList recipes={recipes} query={query} drag={drag} scroll={scroll} />
    </div>
  )
}

function mapStateToProps(state: IState): Pick<IRecipesProps, "recipes"> {
  return {
    recipes: getTeamRecipes(state, "personal"),
  }
}

const mapDispatchToProps = (
  dispatch: Dispatch,
): Pick<IRecipesProps, "fetchData"> => ({
  fetchData: fetchingRecipeListAsync(dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(RecipesListSearch)
