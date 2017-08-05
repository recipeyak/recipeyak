import React from 'react'
import PropTypes from 'prop-types'
import Navbar from './Nav.jsx'
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

  handleInputChange (e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleFocus (event) {
    event.target.select()
  }

  cancelAddIngredient () {
    this.setState({ ingredient: '', addingIngredient: false })
  }

  cancelAddStep () {
    this.setState({ step: '', addingStep: false })
  }

  addingStep () {
    this.setState({ addingStep: true })
  }

  addingIngredient () {
    this.setState({ addingIngredient: true })
  }

  addIngredient (id, ingredient) {
    this.props.addIngredient(id, ingredient)
    this.setState({ ingredient: '' })
    this.refs.addIngredientInput.focus()
  }

  addStep (id, step) {
    this.props.addStep(id, step)
    this.setState({ step: '' })
    this.refs.addStepInput.focus()
  }

  render () {
    const { state } = this

    const {
      id,
      ingredients,
      steps,
      name,
      author,
      source,
      time,
      updateStep,
      deleteStep,
      updateIngredient,
      deleteIngredient,
      updateAuthor,
      updateSource,
      updateName,
      updateTime,
    } = this.props

    return (
      <div className="container">
        <Navbar />
          <div className="field">
            <EnhancedTextInput
              className="title is-1"
              onChange={ name => updateName(id, name) }
              text={ name }
              name="name"
            />
          </div>
          <div className="input-container">

            <EnhancedTextInput
              onChange={ author => updateAuthor(id, author) }
              text={ author }
              className="title is-4"
              placeholder="author"
              name="author"/>

            <EnhancedTextInput
              onChange={ source => updateSource(id, source) }
              text={ source }
              className="title is-4"
              placeholder="source"
              name="source"/>

            <EnhancedTextInput
              onChange={ time => updateTime(id, time) }
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
                          key={x + i}
                          index={i}
                          text={x}
                          update={(index, content) => updateIngredient(index, content)}
                          delete={(i) => deleteIngredient(id, i)}
                        />
                      )
                    }
                  </ul>
                  { state.addingIngredient
                  ? <form onSubmit={ (e) => {
                    e.preventDefault()
                    if (state.ingredient === '') return
                    this.addIngredient(id, state.ingredient)
                  }
                  }>
                  <div className="field">
                    <div className="control">
                      <input
                        ref='addIngredientInput'
                        onChange={ (e) => this.handleInputChange(e) }
                        value={ state.ingredient }
                        autoFocus
                        onFocus={ (e) => this.handleFocus(e) }
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
                        onClick={ () => this.cancelAddIngredient() }
                        className="button"
                        type="button"
                        name="cancel add ingredient"
                        value="✕"/>
                    </p>
                  </div>
                  </form>
                  : <p className="flex-center">
                      <button
                        onClick={ () => this.addingIngredient() }
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
                        <div key={step + i}>
                          <label className="label">Step { i + 1}</label>
                          <ListItem
                            index={i}
                            text={step}
                            update={(index, content) => updateStep(index, content)}
                            delete={(index) => deleteStep(id, index)}
                          />
                        </div>
                      )
                    }
                  </ul>
                  { state.addingStep
                      ? <form onSubmit={ (e) => {
                        e.preventDefault()
                        if (state.step === '') return
                        this.addStep(id, state.step)
                      }}>
                        <div className="field">
                          <label className="label">Step { steps.length + 1 }</label>
                          <div className="control">
                            <textarea
                              ref='addStepInput'
                              onChange={ (e) => this.handleInputChange(e) }
                              onKeyPress={ (e) => {
                                if (state.step === '') return
                                if (e.shiftKey && e.key === 'Enter') {
                                  e.preventDefault()
                                  this.addStep(id, state.step)
                                }
                              }}
                              autoFocus
                              onFocus={ (e) => this.handleFocus(e) }
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
                              onClick={ () => this.cancelAddStep() }
                              className="button"
                              type="button"
                              name="cancel step"
                              value="✕"/>
                          </p>
                        </div>
                        </form>
                      : <p className="flex-center">
                          <button
                            onClick={ () => this.addingStep() }
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
}

export default Recipe
