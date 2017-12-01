import React from 'react'
import { Link } from 'react-router-dom'

import Ingredient from './Ingredient'
import AddIngredient from './AddIngredient'
import AddStep from './AddStep'
import ListItem from './ListItem'

const RecipeEdit = ({
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
  state,
  props,
  updateStep,
  deleteStep,
  updateIngredient,
  removeIngredient,
  addIngredient,
  addStep,
  deleteRecipe,
  deleting,
  loading,
  save,
  addingIngredient
}) => {
  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <div className="d-grid grid-template-columns-repeat-12-fr grid-gap-1rem">
      <div className="grid-entire-row d-flex align-center justify-space-between">
        <input
          autoFocus
          onChange={ handleInputChange }
          className="input fs-2rem"
          type="text"
          placeholder="new recipe title"
          defaultValue={ name }
          name="name"/>
        <div className="d-flex ml-4">
          <input
            onClick={ save }
            className="button is-primary mr-1"
            type="button"
            value="Save"/>
          <Link to={ `/recipes/${id}` } className="button is-link">Cancel</Link>
        </div>
      </div>

      <div className="d-grid grid-entire-row meta-data-grid">
        <label className="d-flex align-center">By
          <input
            onChange={ handleInputChange }
            className="input ml-2"
            type="text"
            placeholder="Author"
            defaultValue={ author }
            name="author"/>
        </label>
        <label className="d-flex align-center">from
          <input
            onChange={ handleInputChange }
            className="input ml-2"
            type="text"
            placeholder="http://example.com/dumpling-soup"
            defaultValue={ source }
            name="source"/>
        </label>
        <label className="d-flex align-center">creating
          <input
            onChange={ handleInputChange }
            className="input ml-2"
            type="text"
            placeholder="4 to 6 servings"
            defaultValue={ servings }
            name="servings"/>
        </label>
        <label className="d-flex align-center">in
          <input
            onChange={ handleInputChange }
            className="input ml-2"
            type="text"
            placeholder="1 hour"
            defaultValue={ time }
            name="time"/>
        </label>
      </div>

      <section className="ingredients-preparation-grid">
        <div>
          <h2 className="title">Ingredients</h2>
          <div className="box">
            <ul>
              {
                ingredients.map(ingredient =>
                  <Ingredient
                    key={ ingredient.id }
                    id={ ingredient.id }
                    update={ updateIngredient }
                    remove={ removeIngredient }
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
        </div>

        <div >
          <h2 className="title is-3">Preparation</h2>
          <div className="box">
            <ul>
              {
                steps.map((step, i) =>
                  <div key={step.id}>
                    <label className="label">Step { i + 1}</label>
                    <ListItem
                      id={ step.id }
                      text={ step.text }
                      update={ updateStep }
                      delete={ deleteStep }
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
        </div>
      </section>
      <section className="grid-entire-row justify-self-center">
        <button
          onClick={ () => deleteRecipe(id) }
          className={ 'button is-danger ' + (deleting ? 'is-loading' : '')}>
          Delete Recipe
        </button>
      </section>
    </div>
  )
}

class RecipeEditFetching extends React.Component {
  state = { }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  componentWillMount = () => {
    this.props.fetchRecipe(this.props.match.params.id)
  }

  removeIngredient = ingredientID => {
    this.props.deleteIngredient(this.props.id, ingredientID)
  }

  deleteStep = stepID =>
    this.props.deleteStep(this.props.id, stepID)

  updateIngredient = (ingredientID, content) => {
    this.props.updateIngredient(this.props.id, ingredientID, content)
  }

  updateStep = (stepID, text) =>
    this.props.updateStep(this.props.id, stepID, text)

  updateName = name => {
    this.props.updateName(this.props.id, name)
  }

  updateAuthor = author => {
    this.props.updateAuthor(this.props.id, author)
  }

  updateSource = source => {
    this.props.updateSource(this.props.id, source)
  }

  updateTime = time => {
    this.props.updateTime(this.props.id, time)
  }

  save = () => {
    this.props.updateRecipe(this.props.id, this.state)
  }

  render () {
    return (
      <RecipeEdit
        {...this.props}
        {...this}
      />
    )
  }
}

export default RecipeEditFetching
