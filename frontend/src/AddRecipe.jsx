import React from 'react'
import PropTypes from 'prop-types'
import Navbar from './Nav.jsx'
import ListItem from './ListItem.jsx'

import './add-recipe.scss'

class AddRecipe extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      author: '',
      source: '',
      time: '',
      ingredients: [],
      steps: [],
      ingredient: '',
      step: '',
    }
  }

  handleInputChange (e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSubmit (event) {
    event.preventDefault()
    // TODO: Check that form is filled out before entry
    this.props.addRecipe(this.state)
  }

  addIngredient (event) {
    this.setState((prevState) => (
      {
        ingredients: prevState.ingredients.concat(this.state.ingredient),
        ingredient: '',
      }
    ))
  }

  cancelAddIngredient () {
    this.setState({ ingredient: '' })
  }

  addStep (event) {
    this.setState((prevState) => (
      {
        steps: prevState.steps.concat(prevState.step.trim()),
        step: '',
      }
    ))
  }

  deleteStep (stepIndex) {
    this.setState(prevState => ({
      steps: prevState.steps.filter((_, i) => i !== stepIndex),
    }))
  }

  updateStep (stepIndex, content) {
    this.setState(prevState => ({
      steps: prevState.steps.map((x, index) => {
        if (index === stepIndex) {
          return content
        }
        return x
      }),
    }))
  }

  cancelAddStep () {
    this.setState({ step: '' })
  }

  render () {
    const steps = this.state.steps

    const ingredients = this.state.ingredients.map((ingredient, index) => (
      <li className="pre" key={ ingredient + index }>
        { ingredient }
      </li>
      )
    )

    return (
      <div className="container">
        <Navbar />
        <h1 className="title is-2">Add Recipe</h1>
          <div className="field">
            <div className="control">
              <input
                onChange={ (e) => this.handleInputChange(e) }
                className="input input-title" type="text" placeholder="title" name="name"/>
            </div>
          </div>
          <div className="input-container">
            <input
              onChange={ (e) => this.handleInputChange(e) }
              className="input input-author"
              type="text"
              placeholder="Author"
              name="author"/>
            <input
              onChange={ (e) => this.handleInputChange(e) }
              className="input input-source"
              type="text"
              placeholder="http://example.com/dumpling-soup"
              name="source"/>
            <input
              onChange={ (e) => this.handleInputChange(e) }
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
                  { ingredients }
                  <form onSubmit={ (e) => {
                    e.preventDefault()
                    if (this.state.ingredient === '') { return }
                    this.addIngredient(e)
                  }
                  }>
                  <div className="field">
                    <div className="control">
                      <input
                        onChange={ (e) => this.handleInputChange(e) }
                        value={ this.state.ingredient }
                        className="input input-ingredient"
                        type="text"
                        placeholder="Add your ingredient here"
                        name="ingredient"/>
                    </div>
                  </div>
                  <div className="field is-grouped">
                    <p className="control">
                      <input
                        onClick={ () => this.addIngredient() }
                        disabled={ this.state.ingredient === '' }
                        className="button is-primary"
                        type="button"
                        name="add ingredient"
                        value="Add"/>
                    </p>
                    <p className="control">
                      <input
                        onClick={ () => this.cancelAddIngredient() }
                        className={ this.state.ingredient === '' ? 'is-hidden button' : 'button' }
                        type="button"
                        disabled={ this.state.ingredient === '' }
                        name="cancel add ingredient"
                        value="✕"/>
                    </p>
                  </div>
                  </form>
                </div>
              </div>

              <div className="column">
                <h2 className="title is-3">Preparation</h2>
                <div className="box">
                  <ul>
                    {
                      steps.map((step, i) =>
                        <ListItem
                          key={step + i}
                          index={i}
                          text={step}
                          updateStep={(index, content) => this.updateStep(index, content)}
                          deleteStep={(index) => this.deleteStep(index)}
                        />
                      )
                    }
                  </ul>
                  <form onSubmit={ (e) => {
                    e.preventDefault()
                    if (this.state.step === '') { return }
                    this.addStep()
                  }}>
                  <div className="field">
                    <label className="label">Step { steps.length + 1 }</label>
                    <div className="control">
                      <textarea
                        onChange={ (e) => this.handleInputChange(e) }
                        onKeyPress={ (e) => {
                          if (this.state.step === '') { return }
                          if (e.shiftKey && e.key === 'Enter') {
                            e.preventDefault()
                            this.addStep()
                          }
                        }}
                        value={ this.state.step }
                        className="textarea"
                        placeholder="Add your step here"
                        name="step"/>
                    </div>
                  </div>
                  <div className="field is-grouped">
                    <p className="control">
                      <input
                        onClick={ () => this.addStep() }
                        disabled={ this.state.step === '' }
                        className="button is-primary"
                        type="submit"
                        name="save step"
                        value="Add"/>
                    </p>
                    <p className="control">
                      <input
                        onClick={ () => this.cancelAddStep() }
                        disabled={ this.state.step === '' }
                        className={ this.state.step === '' ? 'is-hidden button' : 'button' }
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
              <input
                className="button is-large is-primary"
                type="submit"
                onClick={ (e) => this.handleSubmit(e) }
                onKeyPress={ (e) => this.handleSubmit(e) }
                name="cancel ingredient"
                value="Create Recipe"/>
            </p>
          </div>
      </div>
    )
  }
}

AddRecipe.PropTypes = {
  addRecipe: PropTypes.func.isRequired,
}

export default AddRecipe
