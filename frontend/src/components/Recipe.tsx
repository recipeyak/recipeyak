import React from "react"
import { connect } from "react-redux"
import { Helmet } from "@/components/Helmet"

import NoMatch from "@/components/NoMatch"
import Loader from "@/components/Loader"
import AddStep from "@/components/AddStep"
import AddIngredient, { IIngredientBasic } from "@/components/AddIngredient"
import StepContainer from "@/components/StepContainer"
import Ingredient from "@/components/Ingredient"
import RecipeTitle from "@/components/RecipeTitle"

import {
  addingRecipeIngredient,
  addingRecipeStep,
  fetchingRecipe,
  deletingRecipe,
  updateRecipe,
  deletingIngredient,
  updatingIngredient,
  Dispatch
} from "@/store/actions"
import { RootState } from "@/store/store"
import { RouteComponentProps } from "react-router"
import {
  IRecipe,
  IStep,
  IIngredient,
  getRecipeById,
  RemoteRecipe,
  RDK
} from "@/store/reducers/recipes"
import { IRecipeBasic } from "@/components/RecipeTitle"

type RouteProps = RouteComponentProps<{ id: string }>

const mapStateToProps = (state: RootState, props: RouteProps) => {
  const id = parseInt(props.match.params.id, 10)
  const maybeRecipe = getRecipeById(state, id)
  return { recipe: maybeRecipe }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchRecipe: fetchingRecipe(dispatch),
  addIngredient: addingRecipeIngredient(dispatch),
  addStep: addingRecipeStep(dispatch),
  update: updateRecipe(dispatch),
  remove: deletingRecipe(dispatch),
  updateIngredient: updatingIngredient(dispatch),
  removeIngredient: deletingIngredient(dispatch)
})

interface IRecipeProps extends RouteProps {
  readonly recipe: RemoteRecipe
  readonly update: (id: IRecipe["id"], recipe: IRecipeBasic) => Promise<void>
  readonly remove: (id: IRecipe["id"]) => void
  readonly fetchRecipe: (id: IRecipe["id"]) => void
  readonly addIngredient: (
    id: number,
    { quantity, name, description }: IIngredientBasic
  ) => Promise<void>
  readonly updateIngredient: (
    recipeID: IRecipe["id"],
    ingredientID: IIngredient["id"],
    content: Omit<IIngredient, "id" | "position">
  ) => void
  readonly removeIngredient: (
    recipeID: IRecipe["id"],
    ingredientID: IIngredient["id"]
  ) => void
  readonly addStep: (id: IStep["id"], step: IStep["text"]) => Promise<void>
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
    if (
      this.props.recipe.kind === RDK.NotAsked ||
      this.props.recipe.kind === RDK.Loading
    ) {
      return (
        <section className="d-flex justify-content-center">
          <Loader />
        </section>
      )
    }

    if (this.props.recipe.kind === RDK.Failure) {
      return <NoMatch />
    }

    const recipe = this.props.recipe.data

    return (
      <div className="d-grid grid-gap-2">
        <Helmet title={name} />

        <RecipeTitle
          id={recipe.id}
          name={recipe.name}
          author={recipe.author}
          source={recipe.source}
          servings={recipe.servings}
          time={recipe.time}
          owner={recipe.owner}
          lastScheduled={recipe.last_scheduled}
          update={this.props.update}
          updating={recipe.updating}
          remove={this.props.remove}
          deleting={recipe.deleting}
        />
        <section className="ingredients-preparation-grid">
          <div>
            <h2 className="title is-3 mb-1 font-family-title bold">
              Ingredients
            </h2>
            <ul>
              {recipe.ingredients.map(ingre => (
                <Ingredient
                  key={ingre.id}
                  recipeID={recipe.id}
                  id={ingre.id}
                  quantity={ingre.quantity}
                  name={ingre.name}
                  update={(ingredient: Omit<IIngredient, "id" | "position">) =>
                    this.props.updateIngredient(recipe.id, ingre.id, ingredient)
                  }
                  remove={() =>
                    this.props.removeIngredient(recipe.id, ingre.id)
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
                id={recipe.id}
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
            <StepContainer steps={recipe.steps} recipeID={recipe.id} />
            {this.state.addStep ? (
              <AddStep
                id={recipe.id}
                index={recipe.steps.length + 1}
                autoFocus
                addStep={this.props.addStep}
                onCancel={() => this.setState({ addStep: false })}
                loading={recipe.addingStepToRecipe}
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
