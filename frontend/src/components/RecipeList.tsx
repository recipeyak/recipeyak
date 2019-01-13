import React from "react"
import { connect } from "react-redux"
import RecipeItem from "@/components/RecipeItem"
import Loader from "@/components/Loader"
import { TextInput } from "@/components/Forms"
import { matchesQuery } from "@/search"
import Results from "@/components/Results"
import { byNameAlphabetical } from "@/sorters"
import { Dispatch, fetchingRecipeList } from "@/store/actions"
import { IRecipe, getTeamRecipes } from "@/store/reducers/recipes"
import { ITeam } from "@/store/reducers/teams"
import { RootState } from "@/store/store"
import { WebData, isSuccessOrRefetching } from "@/webdata"

interface IRecipeList {
  readonly recipes: WebData<IRecipe[]>
  readonly query: string
  readonly drag: boolean
  readonly scroll: boolean
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
  readonly fetchData: () => void
  readonly recipes: WebData<IRecipe[]>
  readonly scroll: boolean
  readonly drag: boolean
  readonly noPadding?: boolean
  readonly autoFocusSearch?: boolean
}

interface IRecipesState {
  readonly query: string
}

class RecipesListSearch extends React.Component<IRecipesProps, IRecipesState> {
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
    return (
      <>
        <TextInput
          autoFocus={this.props.autoFocusSearch}
          className={this.props.noPadding ? "" : "mb-4"}
          onChange={this.handleQueryChange}
          placeholder="search • optionally prepended a tag, 'author:' 'name:' 'ingredient:"
        />
        <RecipeList
          recipes={this.props.recipes}
          query={this.state.query}
          drag={this.props.drag}
          scroll={this.props.scroll}
        />
      </>
    )
  }
}

function mapStateToProps(state: RootState, ownProps: IOwnProps) {
  return {
    recipes: getTeamRecipes(state, ownProps.teamID || "personal")
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: fetchingRecipeList(dispatch)
})

type statePropsType = ReturnType<typeof mapStateToProps>

type dispatchPropsType = ReturnType<typeof mapDispatchToProps>

interface IOwnProps {
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
)(RecipesListSearch)
