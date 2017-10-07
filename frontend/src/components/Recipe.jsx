import React from 'react'
import PropTypes from 'prop-types'

import ListItem from './ListItem.jsx'
import EnhancedTextInput from './EnhancedTextInput.jsx'

import './AddRecipe.scss'
import './Recipe.scss'

class Recipe extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      addingStep: false,
      addingIngredient: false,
      ingredient: '',
      step: '',
    }
  }

  componentWillMount = () => {
    this.props.fetchRecipe(this.props.match.params.id)
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleFocus = event => {
    event.target.select()
  }

  cancelAddIngredient = () => {
    this.setState({ ingredient: '', addingIngredient: false })
  }

  cancelAddStep = () => {
    this.setState({ step: '', addingStep: false })
  }

  addingStep = () => {
    this.setState({ addingStep: true })
  }

  addingIngredient = () => {
    this.setState({ addingIngredient: true })
  }

  addIngredient = (id, ingredient) => {
    this.props.addIngredient(id, ingredient)
    this.setState({ ingredient: '' })
    this.refs.addIngredientInput.focus()
  }

  addStep = (id, step) => {
    this.props.addStep(id, step)
    this.setState({ step: '' })
    this.refs.addStepInput.focus()
  }

  handleAddStep = e => {
    e.preventDefault()
    if (this.state.step === '') return
    this.addStep(this.props.id, this.state.step)
  }

  handleAddStepKeyPress = e => {
    if (this.state.step === '') return
    if (e.shiftKey && e.key === 'Enter') {
      e.preventDefault()
      this.addStep(this.props.id, this.state.step)
    }
  }

  handleAddIngredient = e => {
    e.preventDefault()
    if (this.state.ingredient === '') return
    this.addIngredient(this.props.id, this.state.ingredient)
  }

  deleteIngredient = ingredientID => {
    this.props.deleteIngredient(this.props.id, ingredientID)
  }

  deleteStep = stepID => {
    this.props.deleteStep(this.props.id, stepID)
  }

  updateIngredient = (ingredientID, text) => {
    this.props.updateIngredient(this.props.id, ingredientID, text)
  }

  updateStep = (stepID, text) => {
    this.props.updateStep(this.props.id, stepID, text)
  }

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

  render () {
    const { state } = this

    const {
      ingredients,
      steps,
      tags,
      name,
      author,
      source,
      time,
    } = this.props

    return (
      <div>
        <div className="field">
          <EnhancedTextInput
            className="title is-1"
            onChange={ this.updateName }
            text={ name }
            name="name"
          />
        </div>

        <section className="tags">
          {
            tags.map(tag =>
              <span className="tag is-dark is-medium" key={ tag.id }>
                { tag.text }
              </span>
            )
          }
        </section>

        <div className="input-container">

          <EnhancedTextInput
            onChange={ this.updateAuthor }
            text={ author }
            className="title is-4"
            placeholder="author"
            name="author"/>

          <EnhancedTextInput
            onChange={ this.updateSource }
            text={ source }
            className="title is-4"
            placeholder="source"
            name="source"/>

          <EnhancedTextInput
            onChange={ this.updateTime }
            text={ time }
            className="title is-4"
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
                    ingredients.map((x, i) =>
                      <ListItem
                        key={x.id}
                        id={x.id}
                        index={i}
                        text={x.text}
                        update={ this.updateIngredient }
                        delete={ this.deleteIngredient }
                      />
                    )
                  }
                </ul>
                { state.addingIngredient
                ? <form onSubmit={ this.handleAddIngredient }>
                <div className="field">
                  <div className="control">
                    <input
                      ref='addIngredientInput'
                      onChange={ this.handleInputChange }
                      value={ state.ingredient }
                      autoFocus
                      onFocus={ this.handleFocus }
                      className="input input-ingredient"
                      type="text"
                      placeholder="Add your ingredient here"
                      name="ingredient"/>
                  </div>
                </div>
                <div className="field is-grouped">
                  <p className="control">
                    <input
                      disabled={ state.ingredient === '' }
                      className="button is-primary"
                      type="submit"
                      name="add ingredient"
                      value="Add"/>
                  </p>
                  <p className="control">
                    <input
                      onClick={ this.cancelAddIngredient }
                      className="button"
                      type="button"
                      name="cancel add ingredient"
                      value="✕"/>
                  </p>
                </div>
                </form>
                : <p className="flex-center">
                    <button
                      onClick={ this.addingIngredient }
                      className="button is-link">
                      Add another
                    </button>
                  </p>
                }
              </div>
            </div>

            <div className="column">
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
                          update={ this.updateStep }
                          delete={ this.deleteStep }
                        />
                      </div>
                    )
                  }
                </ul>
                { state.addingStep
                    ? <form onSubmit={ this.handleAddStep }>
                      <div className="field">
                        <label className="label">Step { steps.length + 1 }</label>
                        <div className="control">
                          <textarea
                            ref='addStepInput'
                            onChange={ this.handleInputChange }
                            onKeyPress={ this.handleAddStepKeyPress }
                            autoFocus
                            onFocus={ this.handleFocus }
                            value={ state.step }
                            className="textarea"
                            placeholder="Add your step here"
                            name="step"/>
                        </div>
                      </div>
                      <div className="field is-grouped">
                        <p className="control">
                          <input
                            disabled={ state.step === '' }
                            className="button is-primary"
                            type="submit"
                            name="save step"
                            value="Add"/>
                        </p>
                        <p className="control">
                          <input
                            onClick={ this.cancelAddStep }
                            className="button"
                            type="button"
                            name="cancel step"
                            value="✕"/>
                        </p>
                      </div>
                      </form>
                    : <p className="flex-center">
                        <button
                          onClick={ this.addingStep }
                          className="button is-link">
                          Add another
                        </button>
                      </p>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Recipe.PropTypes = {
  id: PropTypes.number.isRequired,
  ingredients: PropTypes.array.isRequired,
  steps: PropTypes.array.isRequired,
  name: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  source: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  addStep: PropTypes.func.isRequired,
  updateStep: PropTypes.func.isRequired,
  deleteStep: PropTypes.func.isRequired,
  updateName: PropTypes.func.isRequired,
  updateIngredient: PropTypes.func.isRequired,
  deleteIngredient: PropTypes.func.isRequired,
  fetchRecipe: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
}

Recipe.defaultProps = {
  ingredients: [],
  steps: [],
  tags: [],
  recipe: {},
}

export default Recipe
