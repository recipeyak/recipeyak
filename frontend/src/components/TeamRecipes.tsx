import React from "react"
import { Link } from "react-router-dom"
import Loader from "@/components/Loader"

import { TextInput } from "@/components/Forms"
import { searchRecipes } from "@/search"

import { RecipeItem as Recipe } from "@/components/RecipeItem"
import { IRecipe } from "@/store/reducers/recipes"

interface ITeamRecipesProps {
  readonly loading: boolean
  readonly recipes: IRecipe[]
}

interface ITeamRecipesState {
  readonly query: string
}

export default class TeamRecipes extends React.Component<
  ITeamRecipesProps,
  ITeamRecipesState
> {
  ENABLE_SEARCH_THRESHOLD = 8

  state: ITeamRecipesState = {
    query: "",
  }

  render() {
    const { loading, recipes } = this.props
    const results = searchRecipes({ recipes, query: this.state.query })
    return (
      <div>
        <section className="d-flex justify-space-between align-items-center mb-4">
          <h2 className="fs-6">Recipes</h2>
          <Link to="/recipes/add" className="button is-primary">
            Create Recipe
          </Link>
        </section>

        {recipes.length > this.ENABLE_SEARCH_THRESHOLD ? (
          <TextInput
            placeholder="search • optionally prepended a tag, 'author:' 'name:' 'ingredient:"
            className="mb-4"
            value={this.state.query}
            onChange={e => this.setState({ query: e.target.value })}
          />
        ) : null}

        {loading ? (
          <Loader />
        ) : recipes.length === 0 ? (
          <section>
            <h1 className="text-center fs-6 bold text-muted">
              No Team Recipes
            </h1>
            <p className="text-center">
              Use the Create Recipe button to add one.
            </p>
          </section>
        ) : (
          <section className="recipe-grid">
            {results.recipes.length > 0 ? (
              results.recipes.map(x => (
                <Recipe {...x.recipe} match={x.match} key={x.recipe.id} />
              ))
            ) : (
              <p className="grid-entire-row justify-center fs-6 break-word">
                No recipes found matching <strong>{this.state.query}</strong>
              </p>
            )}
          </section>
        )}
      </div>
    )
  }
}
