import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import { Helmet } from "@/components/Helmet"
import NoMatch from "@/components/NoMatch"
import Loader from "@/components/Loader"
import AddStep from "@/components/AddStep"
import AddIngredient, { IIngredientBasic } from "@/components/AddIngredient"
import StepContainer from "@/components/StepContainer"
import Ingredient from "@/components/Ingredient"
import RecipeTitle from "@/components/RecipeTitle"
import { IState } from "@/store/store"
import { RouteComponentProps } from "react-router"
import {
  IRecipe,
  IIngredient,
  getRecipeById,
  fetchRecipe,
  addIngredientToRecipe,
  deleteIngredient,
  updateIngredient
} from "@/store/reducers/recipes"
import { isInitial, isLoading, isFailure, WebData } from "@/webdata"
import { SectionTitle } from "@/components/RecipeHelpers"

type RouteProps = RouteComponentProps<{ id: string }>

const mapStateToProps = (state: IState, props: RouteProps) => {
  const id = parseInt(props.match.params.id, 10)
  const maybeRecipe = getRecipeById(state, id)
  return { recipe: maybeRecipe }
}

const mapDispatchToProps = {
  fetchRecipe: fetchRecipe.request,
  addIngredient: addIngredientToRecipe.request,
  removeIngredient: deleteIngredient.request,
  updateIngredient: updateIngredient.request
}

interface IRecipeProps extends RouteProps {
  readonly recipe: WebData<IRecipe>
  readonly fetchRecipe: (id: IRecipe["id"]) => void
  readonly addIngredient: (args: {
    recipeID: number
    ingredient: IIngredientBasic
  }) => void
  readonly updateIngredient: (args: {
    recipeID: IRecipe["id"]
    ingredientID: IIngredient["id"]
    content: Omit<IIngredient, "id" | "position">
  }) => void
  readonly removeIngredient: (args: {
    recipeID: IRecipe["id"]
    ingredientID: IIngredient["id"]
  }) => void
}

function Recipe(props: IRecipeProps) {
  const [addStep, setAddStep] = useState(false)
  const [addIngredient, setAddIngredient] = useState(false)

  useEffect(() => {
    // TODO(sbdchd): use mergeProps
    props.fetchRecipe(parseInt(props.match.params.id, 10))
  }, [])

  if (isInitial(props.recipe) || isLoading(props.recipe)) {
    return (
      <section className="d-flex justify-content-center">
        <Loader />
      </section>
    )
  }

  if (isFailure(props.recipe)) {
    return <NoMatch />
  }

  const recipe = props.recipe.data

  return (
    <div className="d-grid grid-gap-2">
      <Helmet title={recipe.name} />

      <RecipeTitle
        id={recipe.id}
        name={recipe.name}
        author={recipe.author}
        source={recipe.source}
        servings={recipe.servings}
        time={recipe.time}
        owner={recipe.owner}
        lastScheduled={recipe.last_scheduled}
        updating={recipe.updating}
        deleting={recipe.deleting}
        editing={recipe.editing}
      />
      <section className="ingredients-preparation-grid">
        <div>
          <SectionTitle>Ingredients</SectionTitle>
          <ul>
            {recipe.ingredients.map(ingre => (
              <Ingredient
                key={ingre.id}
                recipeID={recipe.id}
                id={ingre.id}
                quantity={ingre.quantity}
                name={ingre.name}
                update={(ingredient: Omit<IIngredient, "id" | "position">) =>
                  props.updateIngredient({
                    recipeID: recipe.id,
                    ingredientID: ingre.id,
                    content: ingredient
                  })
                }
                remove={() =>
                  props.removeIngredient({
                    recipeID: recipe.id,
                    ingredientID: ingre.id
                  })
                }
                updating={ingre.updating}
                removing={ingre.removing}
                description={ingre.description}
                optional={ingre.optional}
              />
            ))}
          </ul>
          {addIngredient ? (
            <AddIngredient
              id={recipe.id}
              autoFocus
              loading={!!recipe.addingIngredient}
              addIngredient={props.addIngredient}
              onCancel={() => setAddIngredient(false)}
            />
          ) : (
            <a className="text-muted" onClick={() => setAddIngredient(true)}>
              add
            </a>
          )}
        </div>

        <div>
          <SectionTitle>Preparation</SectionTitle>
          <StepContainer steps={recipe.steps} recipeID={recipe.id} />
          {addStep ? (
            <AddStep
              id={recipe.id}
              index={recipe.steps.length + 1}
              step={props.recipe.data.draftStep}
              autoFocus
              onCancel={() => setAddStep(false)}
              loading={recipe.addingStepToRecipe}
            />
          ) : (
            <a className="text-muted" onClick={() => setAddStep(true)}>
              add
            </a>
          )}
        </div>
      </section>
    </div>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Recipe)
