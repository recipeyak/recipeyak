import React from "react"
import { connect } from "react-redux"
import RecipeItem from "@/components/RecipeItem"
import Loader from "@/components/Loader"
import { TextInput } from "@/components/Forms"
import { matchesQuery } from "@/search"
import Results from "@/components/Results"
import { byNameAlphabetical } from "@/sorters"
import { Dispatch, fetchingRecipeList } from "@/store/actions"
import { IRecipe, getRecipes } from "@/store/reducers/recipes"
import { ITeam } from "@/store/reducers/teams"
import { RootState } from "@/store/store"
import { isSuccess } from "@/store/remotedata"

const mapStateToProps = (state: RootState) => {
  return {
    // TODO(sbdchd): this should be a getter
    recipes: getRecipes(state)
      .filter(isSuccess)
      .map(r => r.data)
      .sort(byNameAlphabetical),
    loading: state.recipes.loadingAll
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: fetchingRecipeList(dispatch)
})

interface IRecipesProps {
  readonly fetchData: (teamID: ITeam["id"] | "personal") => void
  readonly recipes: IRecipe[]
  readonly loading: boolean
  readonly teamID: ITeam["id"]
  readonly scroll: boolean
  readonly drag: boolean
  readonly noPadding?: boolean
}

interface IRecipesState {
  readonly query: string
}

class Recipes extends React.Component<IRecipesProps, IRecipesState> {
  state: IRecipesState = {
    query: ""
  }

  componentWillMount() {
    const teamID = this.props.teamID == null ? "personal" : this.props.teamID
    this.props.fetchData(teamID)
  }

  handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ query: e.target.value })
  }

  render() {
    const results: JSX.Element[] = this.props.recipes
      .filter(recipe => matchesQuery(recipe, this.state.query))
      .map(recipe => (
        <RecipeItem
          {...recipe}
          teamID={this.props.teamID}
          drag={this.props.drag}
          key={recipe.id}
        />
      ))

    const scrollClass = this.props.scroll ? "recipe-scroll" : ""

    return (
      <>
        <TextInput
          className={this.props.noPadding ? "" : "mb-4"}
          onChange={this.handleQueryChange}
          placeholder="search • optionally prepended a tag, 'author:' 'name:' 'ingredient:"
        />

        {this.props.loading ? (
          <Loader className="pt-4" />
        ) : (
          <div className={scrollClass}>
            <div className="recipe-grid">
              <Results recipes={results} query={this.state.query} />
            </div>
          </div>
        )}
      </>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Recipes)
