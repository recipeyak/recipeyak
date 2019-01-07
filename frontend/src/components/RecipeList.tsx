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
import { isSuccess } from "@/webdata"

interface IRecipesProps {
  readonly fetchData: () => void
  readonly recipes: IRecipe[]
  readonly loading: boolean
  readonly scroll: boolean
  readonly drag: boolean
  readonly noPadding?: boolean
  readonly autoFocusSearch?: boolean
}

interface IRecipesState {
  readonly query: string
}

class RecipesList extends React.Component<IRecipesProps, IRecipesState> {
  state: IRecipesState = {
    query: ""
  }

  componentWillMount() {
    this.props.fetchData()
  }

  handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ query: e.target.value })
  }

  render() {
    const results: JSX.Element[] = this.props.recipes
      .filter(recipe => matchesQuery(recipe, this.state.query))
      .map(recipe => (
        <RecipeItem {...recipe} drag={this.props.drag} key={recipe.id} />
      ))

    const scrollClass = this.props.scroll ? "recipe-scroll" : ""

    return (
      <>
        <TextInput
          autoFocus={this.props.autoFocusSearch}
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

function mapStateToProps(state: RootState) {
  // TODO(sbdchd): this should be a getter
  const recipes = getRecipes(state)
    .filter(isSuccess)
    .map(r => r.data)
    .sort(byNameAlphabetical)
  return {
    recipes,
    loading: state.recipes.loadingAll
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: fetchingRecipeList(dispatch)
})

type statePropsType = ReturnType<typeof mapStateToProps>

type dispatchPropsType = ReturnType<typeof mapDispatchToProps>

interface IOwnProps
  extends Minus<IRecipesProps, statePropsType & dispatchPropsType> {
  readonly teamID: ITeam["id"] | null
}

function mergeProps(
  stateProps: statePropsType,
  dispatchProps: dispatchPropsType,
  ownProps: IOwnProps
) {
  const teamID = ownProps.teamID == null ? "personal" : ownProps.teamID
  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    fetchData: () => dispatchProps.fetchData(teamID)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(RecipesList)
