import React from 'react'
import PropTypes from 'prop-types'
import ListItem from './ListItem.jsx'

import AddIngredientForm from './AddIngredientForm'

import './AddRecipe.scss'

const Ingredient = ({
  unit,
  quantity,
  name,
  description
}) =>
  <div>
    <span>
      { unit }
    </span>
    <span>
      { quantity }
    </span>
    <span>
      { name }
    </span>
    <span>
      { description }
    </span>
  </div>

class AddRecipe extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      recipename: '',
      author: '',
      source: '',
      time: '',
      ingredients: [],
      ingredient: {},
      steps: [],
      step: ''
    }
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSubmit = event => {
    event.preventDefault()
    // TODO: Check that form is filled out before entry
    this.props.addRecipe(this.state)
  }

  addIngredient = e => {
    e.preventDefault()
    this.setState((prevState) => (
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

  delete (items, index) {
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

  cancelAddStep = () => {
    this.setState({ step: '' })
  }

  render () {
    const { ingredients, steps, ingredient, step } = this.state

    const {
      unit = -1,
      units = [],
      quantity = '',
      name = '',
      description = ''
    } = ingredient

    return (
      <div>
        <h1 className="title is-2">Add Recipe</h1>
          <div className="field">
            <div className="control">
              <input
                autoFocus
                onChange={ this.handleInputChange }
                className="input input-title" type="text" placeholder="title" name="recipename"/>
            </div>
          </div>
          <div className="input-container">
            <input
              onChange={ this.handleInputChange }
              className="input input-author"
              type="text"
              placeholder="Author"
              name="author"/>
            <input
              onChange={ this.handleInputChange }
              className="input input-source"
              type="text"
              placeholder="http://example.com/dumpling-soup"
              name="source"/>
            <input
              onChange={ this.handleInputChange }
              className="input input-time"
              type="text"
              placeholder="1 hour"
              name="time"/>
          </div>

          <div className="container">
            <div className="columns">
              <div className="column is-one-third">
                <h2 className="title">Ingredients</h2>
                <div className="box">
                  <ul>
                    {
                      ingredients.map((ingredient, i) =>
                        <Ingredient
                          key={ ingredient.name + i }
                          index={ i }
                          quantity={ ingredient.quantity }
                          unit={ ingredient.unit }
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
                    units={ units }
                    quantity={ quantity }
                    unit={ unit }
                    name={ name }
                    description={ description }
                  />
                </div>
              </div>

              <div className="column">
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
                            delete={(index) => this.delete('steps', index)}
                          />
                        </div>
                      )
                    }
                  </ul>
                  <form onSubmit={ e => {
                    e.preventDefault()
                    if (step === '') return
                    this.addStep()
                  }}>
                  <div className="field">
                    <label className="label">Step { steps.length + 1 }</label>
                    <div className="control">
                      <textarea
                        onChange={ this.handleInputChange }
                        onKeyPress={ e => {
                          if (step === '') return
                          if (e.shiftKey && e.key === 'Enter') {
                            e.preventDefault()
                            this.addStep()
                          }
                        }}
                        value={ step }
                        className="textarea"
                        placeholder="Add your step here"
                        name="step"/>
                    </div>
                  </div>
                  <div className="field is-grouped">
                    <p className="control">
                      <input
                        onClick={ this.addStep }
                        disabled={ step === '' }
                        className="button is-primary"
                        type="submit"
                        name="save step"
                        value="Add"/>
                    </p>
                    <p className="control">
                      <input
                        onClick={ this.cancelAddStep }
                        disabled={ step === '' }
                        className={ step === '' ? 'is-hidden button' : 'button' }
                        type="button"
                        name="cancel step"
                        value="✕"/>
                    </p>
                  </div>
                  </form>
                </div>
              </div>
            </div>
            <p className="flex-center">
              <button
                className={ 'button is-large is-primary ' + (this.props.loading ? 'is-loading' : '')}
                type="submit"
                onClick={ this.handleSubmit }
                onKeyPress={ this.handleSubmit }
                name="create recipe">
                Create Recipe
              </button>
            </p>
            {
              !!this.props.error &&
              <p>
                Error creating recipe
              </p>
            }
          </div>
      </div>
    )
  }
}

AddRecipe.PropTypes = {
  addRecipe: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
}

export default AddRecipe
