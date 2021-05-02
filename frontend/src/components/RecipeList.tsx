import React, { useState, useEffect } from "react"
import { connect } from "react-redux"
import RecipeItem from "@/components/RecipeItem"
import Loader from "@/components/Loader"
import { TextInput } from "@/components/Forms"
import { searchRecipes } from "@/search"
import { Dispatch, fetchingRecipeListAsync } from "@/store/thunks"
import { IRecipe, getTeamRecipes } from "@/store/reducers/recipes"
import { ITeam } from "@/store/reducers/teams"
import { IState } from "@/store/store"
import { WebData, isSuccessOrRefetching } from "@/webdata"
import queryString from "query-string"
import { parseIntOrNull } from "@/parseIntOrNull"
import { Link } from "react-router-dom"
import { useDispatch } from "@/hooks"
import { replace } from "connected-react-router"
import { styled } from "@/theme"

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

const MatchOn = styled.div`
  margin-bottom: 0.5rem;
  color: ${props => props.theme.color.muted};
`

interface IRecipeList {
  readonly recipes: WebData<IRecipe[]>
  readonly query: string
  readonly drag?: boolean
  readonly scroll?: boolean
}

function RecipeList(props: IRecipeList) {
  if (!isSuccessOrRefetching(props.recipes)) {
    return <Loader className="pt-4" />
  }

  const results = searchRecipes({
    recipes: props.recipes.data,
    query: props.query,
    includeArchived: true,
  })

  const normalResults = results.recipes
    .filter(result => !result.recipe.archived_at)
    .map(result => (
      <RecipeItem
        {...result.recipe}
        match={result.match}
        drag={props.drag}
        key={result.recipe.id}
      />
    ))
  const archivedResults = results.recipes
    .filter(result => result.recipe.archived_at)
    .map(result => (
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
      <MatchOn>matching on: {results.matchOn.join(" or ")}</MatchOn>
      <div className="recipe-grid">
        <Results recipes={normalResults} query={props.query} />
      </div>
      {archivedResults.length > 0 && (
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
      )}
    </div>
  )
}

interface IRecipesProps {
  readonly fetchData: (teamID: TeamID) => void
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
function RecipesListSearch({
  fetchData,
  noPadding,
  recipes,
  drag,
  scroll,
  teamID,
}: IRecipesProps) {
  const dispatch = useDispatch()
  const [query, setQuery] = useState(() => {
    const urlQuery = getSearch(window.location.search)
    dispatch(replace({ search: "" }))
    return urlQuery
  })

  useEffect(() => {
    const teamID_ = teamID == null ? "personal" : teamID
    fetchData(teamID_)
  }, [fetchData, teamID])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQuery(e.target.value)

  return (
    <>
      <TextInput
        value={query}
        className={noPadding ? "" : "mb-1"}
        onChange={handleQueryChange}
        placeholder="search • optionally prepended a tag, 'author:' 'name:' 'ingredient:"
      />
      <RecipeList recipes={recipes} query={query} drag={drag} scroll={scroll} />
    </>
  )
}

function mapStateToProps(
  state: IState,
  ownProps: Pick<IRecipesProps, "teamID">,
): Pick<IRecipesProps, "recipes"> {
  return {
    recipes: getTeamRecipes(state, ownProps.teamID || "personal"),
  }
}

const mapDispatchToProps = (
  dispatch: Dispatch,
): Pick<IRecipesProps, "fetchData"> => ({
  fetchData: fetchingRecipeListAsync(dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(RecipesListSearch)
