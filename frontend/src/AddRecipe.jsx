import React from 'react'
import PropTypes from 'prop-types'
import Navbar from './Nav.jsx'

import './add-recipe.scss'

class AddRecipe extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      title: '',
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

    const { title, author, source, time, ingredients, steps } = this.state
    console.log({ title, author, source, time, ingredients, steps })
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

  cancelAddStep () {
    this.setState({ step: '' })
  }

  render () {
    const steps = this.state.steps.map((step, index) => (
      <li key={ step + index }>
        <h2 className="label">Step { index + 1 }</h2>
        <p className="pre">{ step }</p>
      </li>
      )
    )
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
        <form onSubmit={ (e) => this.handleSubmit(e) }>
          <div className="field">
            <div className="control">
              <input
                onChange={ (e) => this.handleInputChange(e) }
                className="input input-title" type="text" placeholder="title" name="title"/>
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
                </div>
              </div>

              <div className="column">
                <h2 className="title is-3">Preparation</h2>
                <div className="box">
                  <ul>
                    { steps }
                  </ul>

                  <div className="field">
                    <label className="label">Step { steps.length + 1 }</label>
                    <div className="control">
                      <textarea
                        onChange={ (e) => this.handleInputChange(e) }
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
                        type="button"
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
                </div>
              </div>
            </div>
            <p className="flex-center">
              <input
                className="button is-large is-primary"
                type="submit"
                name="cancel ingredient"
                value="Create Recipe"/>
            </p>
          </div>
        </form>
      </div>
    )
  }
}

AddRecipe.PropTypes = {
  AddRecipe: PropTypes.func.isRequired,
}

export default AddRecipe
