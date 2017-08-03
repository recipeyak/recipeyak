import React from 'react'
import PropTypes from 'prop-types'
import Navbar from './Nav.jsx'
import ListItem from './ListItem.jsx'
import EnhancedInput from './EnhancedInput.jsx'

import './AddRecipe.scss'

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

  updateTitle (e) {
    console.log('updateTitle', e.target.value)
  }

  handleInputChange (e) {
    this.setState({ [e.target.name]: e.target.value })
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

  render () {
    const { state } = this

    const {
      ingredients,
      steps,
      name,
      author,
      source,
      time,
      addStep,
      updateStep,
      deleteStep,
      addIngredient,
      updateIngredient,
      deleteIngredient,
    } = this.props

    return (
      <div className="container">
        <Navbar />
        <h1 className="title is-2">Add Recipe</h1>
          <div className="field">
            <EnhancedInput
              onChange={ (e) => this.updateTitle(e) }
              text={ name }
              name="name"
            />
          </div>
          <div className="input-container">

            <div>
              <h3 className="input-author">{ author }</h3>
              <input
                onChange={ (e) => this.handleInputChange(e) }
                defaultValue={ author }
                className="input input-author"
                type="text"
                placeholder="Author"
                name="author"/>
            </div>

            <div>
              <h3 className="input-source">{ source }</h3>
              <input
                onChange={ (e) => this.handleInputChange(e) }
                defaultValue={ source }
                className="input input-source"
                type="text"
                placeholder="http://example.com/dumpling-soup"
                name="source"/>
            </div>

            <div>
              <h3 className="input-time">{ time }</h3>
              <input
                onChange={ (e) => this.handleInputChange(e) }
                defaultValue={ time }
                className="input input-time"
                type="text"
                placeholder="1 hour"
                name="time"/>
            </div>
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
                          delete={(index) => deleteIngredient(index)}
                        />
                      )
                    }
                  </ul>
                  { this.addingIngredient
                  ? <form onSubmit={ (e) => {
                    e.preventDefault()
                    if (state.ingredient === '') return
                    addIngredient(state.ingredient)
                  }
                  }>
                  <div className="field">
                    <div className="control">
                      <input
                        onChange={ (e) => this.handleInputChange(e) }
                        value={ state.ingredient }
                        className="input input-ingredient"
                        type="text"
                        placeholder="Add your ingredient here"
                        name="ingredient"/>
                    </div>
                  </div>
                  <div className="field is-grouped">
                    <p className="control">
                      <input
                        onClick={ () => addIngredient(state.ingredient) }
                        disabled={ state.ingredient === '' }
                        className="button is-primary"
                        type="button"
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
                  : <p>
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
                            delete={(index) => deleteStep('steps', index)}
                          />
                        </div>
                      )
                    }
                  </ul>
                  { state.addingStep
                      ? <form onSubmit={ (e) => {
                        e.preventDefault()
                        if (state.step === '') return
                        addStep(state.step)
                      }}>
                        <div className="field">
                          <label className="label">Step { steps.length + 1 }</label>
                          <div className="control">
                            <textarea
                              onChange={ (e) => this.handleInputChange(e) }
                              onKeyPress={ (e) => {
                                if (state.step === '') return
                                if (e.shiftKey && e.key === 'Enter') {
                                  e.preventDefault()
                                  addStep(state.step)
                                }
                              }}
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
                      : <p>
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
  ingredients: PropTypes.array.isRequired,
  steps: PropTypes.array.isRequired,
  name: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  source: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  addStep: PropTypes.func.isRequired,
  updateStep: PropTypes.func.isRequired,
  deleteStep: PropTypes.func.isRequired,
  updateIngredient: PropTypes.func.isRequired,
  deleteIngredient: PropTypes.func.isRequired,
}

export default Recipe
