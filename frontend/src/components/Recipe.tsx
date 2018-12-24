import React from "react"
import { connect } from "react-redux"
import { Helmet } from "./Helmet"

import NoMatch from "./NoMatch"
import Loader from "./Loader"
import AddStep from "./AddStep"
import AddIngredient, { IIngredientBasic } from "./AddIngredient"
import StepContainer from "./StepContainer"
import Ingredient from "./Ingredient"
import RecipeTitle from "./RecipeTitle"

import {
  addingRecipeIngredient,
  addingRecipeStep,
  fetchRecipe,
  deletingRecipe,
  updateRecipe,
  deletingIngredient,
  updatingIngredient,
  Dispatch
} from "../store/actions"
import { RootState } from "../store/store"
import { RouteComponentProps } from "react-router"
import { IRecipe, IStep, IIngredient } from "../store/reducers/recipes"
import { IRecipeBasic } from "./RecipeTitle"

type RouteProps = RouteComponentProps<{ id: string }>

const mapStateToProps = (state: RootState, props: RouteProps) => {
  const id = props.match.params.id
  const recipe = state.recipes[id] ? state.recipes[id] : { loading: true }
  return recipe
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchRecipe: (id: number) => dispatch(fetchRecipe(id)),
  addIngredient: (recipeID: IRecipe["id"], ingredient: IIngredient) =>
    dispatch(addingRecipeIngredient(recipeID, ingredient)),
  addStep: (id: IStep["id"], step: IStep) =>
    dispatch(addingRecipeStep(id, step)),
  update: (id: IRecipe["id"], data: IRecipe) =>
    dispatch(updateRecipe(id, data)),
  remove: (id: IRecipe["id"]) => dispatch(deletingRecipe(id)),
  updateIngredient: (
    recipeID: IRecipe["id"],
    ingredientID: IIngredient["id"],
    content: IIngredient
  ) => dispatch(updatingIngredient(recipeID, ingredientID, content)),
  removeIngredient: (
    recipeID: IRecipe["id"],
    ingredientID: IIngredient["id"]
  ) => dispatch(deletingIngredient(recipeID, ingredientID))
})

interface IRecipeProps extends RouteProps {
  readonly id: IRecipe["id"]
  readonly name: IRecipe["name"]
  readonly author: IRecipe["author"]
  readonly source: IRecipe["source"]
  readonly servings: IRecipe["servings"]
  readonly time: IRecipe["time"]
  readonly ingredients: IIngredient[]
  readonly steps: IStep[]
  readonly loading: boolean
  readonly error404: boolean
  readonly owner: IRecipe["owner"]
  readonly update: (id: IRecipe["id"], recipe: IRecipeBasic) => Promise<void>
  readonly remove: () => void
  readonly deleting: boolean
  readonly updating: boolean
  readonly addingStepToRecipe: boolean
  readonly last_scheduled: string
  readonly fetchRecipe: (id: IRecipe["id"]) => void
  readonly addIngredient: (
    id: number,
    { quantity, name, description }: IIngredientBasic
  ) => void
  readonly updateIngredient: (
    recipeID: IRecipe["id"],
    ingredientID: IIngredient["id"],
    content: IIngredient
  ) => void
  readonly removeIngredient: (
    recipeID: IRecipe["id"],
    ingredientID: IIngredient["id"]
  ) => void
  readonly addStep: () => void
}

interface IRecipeState {
  readonly show: boolean
  readonly addStep: boolean
  readonly addIngredient: boolean
}

class Recipe extends React.Component<IRecipeProps, IRecipeState> {
  state: IRecipeState = {
    show: false,
    addStep: false,
    addIngredient: false
  }

  componentWillMount() {
    this.props.fetchRecipe(parseInt(this.props.match.params.id, 10))
  }

  render() {
    const { id, name, ingredients, steps, loading, error404 } = this.props
    if (error404) {
      return <NoMatch />
    }
    if (loading) {
      return (
        <section className="d-flex justify-content-center">
          <Loader />
        </section>
      )
    }
    return (
      <div className="d-grid grid-gap-2">
        <Helmet title={name} />

        <RecipeTitle
          id={this.props.id}
          name={this.props.name}
          author={this.props.author}
          source={this.props.source}
          servings={this.props.servings}
          time={this.props.time}
          owner={this.props.owner}
          lastScheduled={this.props.last_scheduled}
          update={this.props.update}
          updating={this.props.updating}
          remove={this.props.remove}
          deleting={this.props.deleting}
        />
        <section className="ingredients-preparation-grid">
          <div>
            <h2 className="title is-3 mb-1 font-family-title bold">
              Ingredients
            </h2>
            <ul>
              {ingredients.map(ingre => (
                <Ingredient
                  key={ingre.id}
                  recipeID={this.props.id}
                  id={ingre.id}
                  quantity={ingre.quantity}
                  name={ingre.name}
                  update={(ingredient: IIngredient) =>
                    this.props.updateIngredient(
                      this.props.id,
                      ingre.id,
                      ingredient
                    )
                  }
                  remove={() =>
                    this.props.removeIngredient(this.props.id, ingre.id)
                  }
                  updating={ingre.updating}
                  removing={ingre.removing}
                  description={ingre.description}
                  optional={ingre.optional}
                />
              ))}
            </ul>
            {this.state.addIngredient ? (
              <AddIngredient
                id={id}
                autoFocus
                loading={false}
                addIngredient={this.props.addIngredient}
                onCancel={() => this.setState({ addIngredient: false })}
              />
            ) : (
              <a
                className="text-muted"
                onClick={() => this.setState({ addIngredient: true })}>
                add
              </a>
            )}
          </div>

          <div>
            <h2 className="title is-3 mb-1 font-family-title bold">
              Preparation
            </h2>
            <StepContainer steps={steps} recipeID={id} />
            {this.state.addStep ? (
              <AddStep
                id={id}
                index={steps.length + 1}
                autoFocus
                addStep={this.props.addStep}
                onCancel={() => this.setState({ addStep: false })}
                loading={this.props.addingStepToRecipe}
              />
            ) : (
              <a
                className="text-muted"
                onClick={() => this.setState({ addStep: true })}>
                add
              </a>
            )}
          </div>
        </section>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Recipe)
