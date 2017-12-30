import React from 'react'
import { Helmet } from 'react-helmet'

import ListItem from './ListItem'
import AddIngredientForm from './AddIngredientForm'
import AddStepForm from './AddStepForm'
import Ingredient from './Ingredient'

const unfinishedIngredient = ({ quantity = '', name = '' }) =>
  quantity === '' || name === ''

class AddRecipe extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      author: '',
      source: '',
      time: '',
      servings: '',
      ingredients: [],
      ingredient: {},
      steps: [],
      step: ''
    }
  }

  static defaultProps = {
    error: {
      errorWithName: false,
      errorWithIngredients: false,
      errorWithSteps: false
    }
  }

  componentWillMount = () => {
    this.props.clearErrors()
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSubmit = event => {
    event.preventDefault()
    // TODO: Check that form is filled out before entry
    this.props.addRecipe(this.state)
  }

  addIngredient = () => {
    if (unfinishedIngredient(this.state.ingredient)) return
    this.setState(prevState => (
      {
        ingredients: prevState.ingredients.concat(prevState.ingredient),
        ingredient: {}
      }
    ))
  }

  handleIngredientChange = e => {
    e.persist()
    this.setState(prevState => ({
      ingredient: {
        ...prevState.ingredient,
        [e.target.name]: e.target.value
      }
    }))
  }

  cancelAddIngredient = () => {
    this.setState({ ingredient: {} })
  }

  addStep = event => {
    this.setState((prevState) => (
      {
        steps: prevState.steps.concat({ text: prevState.step.trim() }),
        step: ''
      }
    ))
  }

  remove = (items, index) => {
    this.setState(prevState => ({
      [items]: prevState[items].filter((_, i) => i !== index)
    }))
  }

  update (items, index, content) {
    this.setState(prevState => ({
      [items]: prevState[items].map((x, i) => {
        if (i === index) {
          return content
        }
        return x
      })
    }))
  }

  updateIngredient = (index, content) =>
    this.update('ingredients', index, content)

  removeIngredient = index => {
    this.remove('ingredients', index)
  }

  cancelAddStep = () => {
    this.setState({ step: '' })
  }

  render () {
    const {
      ingredients,
      steps,
      ingredient,
      step
    } = this.state

    const {
      addStep,
      handleInputChange,
      cancelAddStep
    } = this

    const { error } = this.props

    const {
      errorWithName,
      errorWithIngredients,
      errorWithSteps
    } = error

    const {
      quantity = '',
      name = '',
      description = ''
    } = ingredient

    return (
      <div className="d-grid grid-gap-1rem">
        <Helmet title='Add Recipe'/>
        <div>
          <input
            autoFocus
            onChange={ this.handleInputChange }
            className={ 'my-input fs-2rem' + (errorWithName ? ' is-danger' : '') }
            type="text" placeholder="new recipe title" name="name"/>
          { errorWithName
              ? <p class="fs-4 c-danger">A recipe needs a name</p>
              : null
          }
        </div>

        <div className="d-grid  meta-data-grid">
          <label className="d-flex align-center">By
            <input
              onChange={ this.handleInputChange }
              className="my-input ml-2"
              type="text"
              placeholder="Author"
              name="author"/>
          </label>
          <label className="d-flex align-center">from
            <input
              onChange={ this.handleInputChange }
              className="my-input ml-2"
              type="text"
              placeholder="http://example.com/dumpling-soup"
              name="source"/>
          </label>
          <label className="d-flex align-center">creating
            <input
              onChange={ this.handleInputChange }
              className="my-input ml-2"
              type="text"
              placeholder="4 to 6 servings"
              name="servings"/>
          </label>
          <label className="d-flex align-center">in
            <input
              onChange={ this.handleInputChange }
              className="my-input ml-2"
              type="text"
              placeholder="1 hour"
              name="time"/>
          </label>
        </div>

          <section className="ingredients-preparation-grid">
            <div>
              <h2 className="title">Ingredients</h2>
              <div className="box">
                <ul>
                  {
                    ingredients.map((ingredient, i) =>
                      <Ingredient
                        key={ ingredient.name + i }
                        index={ i }
                        id={ i }
                        update={ this.updateIngredient }
                        remove={ this.removeIngredient }
                        quantity={ ingredient.quantity }
                        name={ ingredient.name }
                        description={ ingredient.description }
                      />
                    )
                  }
                </ul>

                <AddIngredientForm
                  handleAddIngredient={ this.addIngredient }
                  cancelAddIngredient={ this.cancelAddIngredient }
                  handleInputChange={ this.handleIngredientChange }
                  handleFocus={ this.handleFocus }
                  quantity={ quantity }
                  name={ name }
                  description={ description }
                  error={ errorWithIngredients }
                />
              </div>
            </div>

              <div>
                <h2 className="title is-3">Preparation</h2>
                <div className="box">
                  <ul>
                    {
                      steps.map((step, i) =>
                        <div key={step.text + i}>
                          <label className="label">Step { i + 1}</label>
                          <ListItem
                            index={i}
                            text={step.text}
                            update={(index, content) => this.update('steps', index, content)}
                            remove={(index) => this.remove('steps', index)}
                          />
                        </div>
                      )
                    }
                  </ul>
                  <AddStepForm
                    handleInputChange={ handleInputChange }
                    addStep={ addStep }
                    cancelAddStep={ cancelAddStep }
                    stepNumber={ steps.length + 1 }
                    text={ step }
                    error={ errorWithSteps }
                  />
              </div>
            </div>
          </section>
        <p className="d-flex justify-center">
          <button
            className={ 'my-button is-large is-primary ' + (this.props.loading ? 'is-loading' : '')}
            type="submit"
            onClick={ this.handleSubmit }
            onKeyPress={ this.handleSubmit }
            name="create recipe">
            Create Recipe
          </button>
        </p>
      </div>
    )
  }
}

export default AddRecipe
