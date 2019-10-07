import React, { useState, useEffect } from "react"
import { connect } from "react-redux"
import RecipeItem from "@/components/RecipeItem"
import Loader from "@/components/Loader"
import { TextInput } from "@/components/Forms"
import { matchesQuery } from "@/search"
import Results from "@/components/Results"
import { byNameAlphabetical } from "@/sorters"
import { Dispatch, fetchingRecipeListAsync } from "@/store/thunks"
import { IRecipe, getTeamRecipes } from "@/store/reducers/recipes"
import { ITeam } from "@/store/reducers/teams"
import { IState } from "@/store/store"
import { WebData, isSuccessOrRefetching } from "@/webdata"

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

  const results: JSX.Element[] = props.recipes.data
    .filter(recipe => matchesQuery(recipe, props.query))
    .sort(byNameAlphabetical)
    .map(recipe => <RecipeItem {...recipe} drag={props.drag} key={recipe.id} />)

  const scrollClass = props.scroll ? "recipe-scroll" : ""

  return (
    <div className={scrollClass}>
      <div className="recipe-grid">
        <Results recipes={results} query={props.query} />
      </div>
    </div>
  )
}

interface IRecipesProps {
  readonly fetchData: (teamID: TeamID) => void
  readonly recipes: WebData<IRecipe[]>
  readonly scroll?: boolean
  readonly drag?: boolean
  readonly noPadding?: boolean
  readonly autoFocusSearch?: boolean
  readonly teamID?: ITeam["id"] | "personal" | null
}

function RecipesListSearch({
  fetchData,
  autoFocusSearch,
  noPadding,
  recipes,
  drag,
  scroll,
  teamID
}: IRecipesProps) {
  const [query, setQuery] = useState("")

  useEffect(() => {
    const teamID_ = teamID == null ? "personal" : teamID
    fetchData(teamID_)
  }, [teamID])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQuery(e.target.value)

  return (
    <>
      <TextInput
        autoFocus={autoFocusSearch}
        className={noPadding ? "" : "mb-4"}
        onChange={handleQueryChange}
        placeholder="search • optionally prepended a tag, 'author:' 'name:' 'ingredient:"
      />
      <RecipeList recipes={recipes} query={query} drag={drag} scroll={scroll} />
    </>
  )
}

function mapStateToProps(
  state: IState,
  ownProps: Pick<IRecipesProps, "teamID">
): Pick<IRecipesProps, "recipes"> {
  return {
    recipes: getTeamRecipes(state, ownProps.teamID || "personal")
  }
}

const mapDispatchToProps = (
  dispatch: Dispatch
): Pick<IRecipesProps, "fetchData"> => ({
  fetchData: fetchingRecipeListAsync(dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RecipesListSearch)
