import React from 'react'
import { Helmet } from 'react-helmet'

import ListItem from './ListItem'
import AddIngredientForm from './AddIngredientForm'
import AddStepForm from './AddStepForm'
import Ingredient from './Ingredient'
import { ButtonPrimary } from './Buttons'

const unfinishedIngredient = ({ quantity = '', name = '' }) =>
  quantity === '' || name === ''

class AddRecipe extends React.Component {
  state = {
    ingredient: {
      quantity: '',
      name: '',
      description: ''
    },
    step: ''
  }

  static defaultProps = {
    error: {
      errorWithName: false,
      errorWithIngredients: false,
      errorWithSteps: false
    },
    loading: false,
    name: '',
    author: '',
    source: '',
    time: '',
    servings: '',
    ingredients: [],
    steps: []
  }

  componentWillMount = () =>
    this.props.clearErrors()

  handleInputChange = e =>
    this.setState({ [e.target.name]: e.target.value })

  handleSubmit = event => {
    event.preventDefault()
    const recipe = {
      name: this.props.name,
      author: this.props.author,
      source: this.props.source,
      time: this.props.time,
      servings: this.props.servings,
      ingredients: this.props.ingredients,
      steps: this.props.steps
    }
    this.props.addRecipe(recipe)
  }

  addIngredient = () => {
    if (unfinishedIngredient(this.state.ingredient)) return
    this.props.addIngredient(this.state.ingredient)
    this.setState({ ingredient: {} })
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

  cancelAddIngredient = () =>
    this.setState({ ingredient: {} })

  addStep = () => {
    this.props.addStep({ text: this.state.step })
    this.setState({ step: '' })
  }

  cancelAddStep = () =>
    this.setState({ step: '' })

  render () {
    const {
      ingredient,
      step
    } = this.state

    const {
      addStep,
      handleInputChange,
      cancelAddStep,
      handleSubmit,
      addIngredient,
      cancelAddIngredient,
      handleIngredientChange
    } = this

    const {
      errorWithName,
      errorWithIngredients,
      errorWithSteps
    } = this.props.error

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
            onChange={ this.props.setName }
            value={ this.props.name }
            className={ 'my-input fs-2rem' + (errorWithName ? ' is-danger' : '') }
            type="text" placeholder="new recipe title" name="name"/>
          { errorWithName
              ? <p className="fs-4 c-danger">A recipe needs a name</p>
              : null
          }
        </div>

        <div className="d-grid  meta-data-grid">
          <label className="d-flex align-center">By
            <input
              onChange={ this.props.setAuthor }
              value={ this.props.author }
              className="my-input ml-2"
              type="text"
              placeholder="Author"
              name="author"/>
          </label>
          <label className="d-flex align-center">from
            <input
              onChange={ this.props.setSource }
              value={ this.props.source }
              className="my-input ml-2"
              type="text"
              placeholder="http://example.com/dumpling-soup"
              name="source"/>
          </label>
          <label className="d-flex align-center">creating
            <input
              onChange={ this.props.setServings }
              value={ this.props.servings }
              className="my-input ml-2"
              type="text"
              placeholder="4 to 6 servings"
              name="servings"/>
          </label>
          <label className="d-flex align-center">in
            <input
              onChange={ this.props.setTime }
              value={ this.props.time }
              className="my-input ml-2"
              type="text"
              placeholder="1 hour"
              name="time"/>
          </label>
        </div>

          <section className="ingredients-preparation-grid">
            <div>
              <h2 className="title">Ingredients</h2>
              <ul>
                {
                  this.props.ingredients.map((ingredient, i) =>
                    <Ingredient
                      key={ ingredient.name + i }
                      index={ i }
                      id={ i }
                      update={ this.props.updateIngredient }
                      remove={ this.props.removeIngredient }
                      quantity={ ingredient.quantity }
                      name={ ingredient.name }
                      description={ ingredient.description }
                    />
                  )
                }
              </ul>

              <AddIngredientForm
                handleAddIngredient={ addIngredient }
                cancelAddIngredient={ cancelAddIngredient }
                handleInputChange={ handleIngredientChange }
                quantity={ quantity }
                name={ name }
                description={ description }
                error={ errorWithIngredients }
              />
            </div>

              <div>
                <h2 className="title is-3">Preparation</h2>
                <ul>
                  {
                    this.props.steps.map((step, i) =>
                      <div key={step.text + i}>
                        <label className="label">Step { i + 1}</label>
                        <ListItem
                          id={i}
                          text={step.text}
                          update={ this.props.updateStep }
                          delete={ this.props.removeStep }
                        />
                      </div>
                    )
                  }
                </ul>
                <AddStepForm
                  handleInputChange={ handleInputChange }
                  addStep={ addStep }
                  cancelAddStep={ cancelAddStep }
                  stepNumber={ this.props.steps.length + 1 }
                  text={ step }
                  error={ errorWithSteps }
                />
            </div>
          </section>
        <div className="d-flex justify-space-between align-items-center">
          <button
            className='my-button'
            onClick={ this.props.clearForm }
            name="create recipe">
            Clear
          </button>

          <div className="d-flex justify-space-between">

          <label className="d-flex align-center">for
            <div className="select ml-2 is-small">
            <select >
              <option value="">Personal</option>
              <option value="">Team: Recipe Yak</option>
              <option value="">Team: Red Team</option>
              <option value="">Team: Blue Team</option>
            </select>
          </div>
          </label>

          <ButtonPrimary
            className="ml-2"
            type="submit"
            onClick={ handleSubmit }
            name="create recipe"
            loading={ this.props.loading }>
            Create Recipe
          </ButtonPrimary>
        </div>
        </div>
      </div>
    )
  }
}

export default AddRecipe
