import * as React from 'react'
import { Helmet } from 'react-helmet'

import Ingredient from './Ingredient'
import AddIngredient from './AddIngredient'
import AddStep from './AddStep'
import ListItem from './ListItem'
import NoMatch from './NoMatch'
import Loader from './Loader'
import { ButtonPrimary, ButtonLink } from './Buttons'

interface IRecipeEditFetchingProps {
  id: number
  ingredients: Ingredient[]
  steps: Step[]
  name: string
  author: string
  source: string
  servings: string
  time: string
  addingStepToRecipe: boolean
  handleInputChange(a string): void
  removeIngredient(a string): void
  addIngredient(a string): void
  addStep(a string): void
  deleteRecipe(a string): void
  deleting: boolean
  loading: boolean
  update(a string): void
  addingIngredient: boolean
  error404: boolean
  cancelEdit(a number): void
  updating: boolean
}

class RecipeEditFetching extends React.Component<IRecipeEditFetchingProps,{}> {

  render () {
    const {
      id,
      ingredients = [],
      steps = [],
      name,
      author,
      source,
      servings,
      time,
      addingStepToRecipe,
      handleInputChange,
      updateStep,
      deleteStep,
      updateIngredient,
      removeIngredient,
      addIngredient,
      addStep,
      deleteRecipe,
      deleting,
      loading,
      update,
      addingIngredient,
      error404,
      cancelEdit,
      updating
    } = this.props

    if (error404) {
      return <NoMatch/>
    }

    if (loading) {
      return <section className="d-flex justify-content-center">
        <Loader/>
      </section>
    }

    return (
      <div className="d-grid grid-entire-row grid-gap-1rem">
        <Helmet title={ name + ' | Edit'}/>
        <div className="d-flex align-center justify-space-between">
          <input
            onChange={ handleInputChange }
            className="my-input fs-2rem"
            type="text"
            placeholder="new recipe title"
            defaultValue={ name }
            name="name"/>
        </div>

        <div className="d-grid grid-entire-row meta-data-grid">
          <label className="d-flex align-center">By
            <input
              onChange={ handleInputChange }
              className="my-input ml-2"
              type="text"
              placeholder="Author"
              defaultValue={ author }
              name="author"/>
          </label>
          <label className="d-flex align-center">from
            <input
              onChange={ handleInputChange }
              className="my-input ml-2"
              type="text"
              placeholder="http://example.com/dumpling-soup"
              defaultValue={ source }
              name="source"/>
          </label>
          <label className="d-flex align-center">creating
            <input
              onChange={ handleInputChange }
              className="my-input ml-2"
              type="text"
              placeholder="4 to 6 servings"
              defaultValue={ servings }
              name="servings"/>
          </label>
          <label className="d-flex align-center">in
            <input
              onChange={ handleInputChange }
              className="my-input ml-2"
              type="text"
              placeholder="1 hour"
              defaultValue={ time }
              name="time"/>
          </label>
        </div>

        <section className="ingredients-preparation-grid">
          <div>
            <h2 className="title is-3 mb-1 font-family-title bold">Ingredients</h2>
            <ul>
              {
                ingredients.map(ingredient =>
                  <Ingredient
                    key={ ingredient.id }
                    id={ ingredient.id }
                    update={ updateIngredient }
                    updating={ ingredient.updating }
                    remove={ removeIngredient }
                    removing={ ingredient.removing }
                    quantity={ ingredient.quantity }
                    name={ ingredient.name }
                    description={ ingredient.description }
                  />
                )
              }
            </ul>
            <AddIngredient
              id={ id }
              loading={ addingIngredient }
              addIngredient={ addIngredient }
            />
          </div>

          <div>
            <h2 className="title is-3 mb-1 font-family-title bold">Preparation</h2>
            <ul>
              {
                steps.map((step, i) =>
                  <div key={step.id}>
                    <label className="better-label">Step { i + 1}</label>
                    <ListItem
                      id={ step.id }
                      text={ step.text }
                      update={ updateStep }
                      updating={ step.updating }
                      delete={ deleteStep }
                      removing={ step.removing }
                    />
                  </div>
                )
              }
            </ul>
            <AddStep
              id={ id }
              index={ steps.length + 1 }
              addStep={ addStep }
              loading={ addingStepToRecipe }
            />
          </div>
        </section>

        <section className="grid-entire-row justify-self-end grid-row-4">

          <div className="d-flex">
            <ButtonPrimary
              className='mr-1'
              onClick={ update }
              loading={ updating }>
              Update
            </ButtonPrimary>
            <ButtonLink
              onClick={ cancelEdit }>
              Cancel
            </ButtonLink>
          </div>
        </section>

        <section className="grid-entire-row grid-row-4">
          <button
            onClick={
              () => {
                const message = author !== ''
                  ? `Delete ${name} by ${author}?`
                  : `Delete ${name}`
                if (window.confirm(message)) {
                  deleteRecipe(id)
                }
              }
            }
            className={ 'my-button is-danger ' + (deleting ? 'is-loading' : '')}>
            Delete
          </button>
        </section>
      </div>
    )
  }
}

export default RecipeEditFetching
