import React from 'react'
import PropTypes from 'prop-types'
import Navbar from './Nav.jsx'
import ListItem from './ListItem.jsx'

import './AddRecipe.scss'

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
        ingredients: prevState.ingredients.concat(prevState.ingredient.trim()),
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

  delete (items, index) {
    this.setState(prevState => ({
      [items]: prevState[items].filter((_, i) => i !== index),
    }))
  }

  update (items, index, content) {
    this.setState(prevState => ({
      [items]: prevState[items].map((x, i) => {
        if (i === index) {
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
    const { ingredients, steps, ingredient, step } = this.state

    return (
      <div className="container">
        <Navbar />
        <section className="section">
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
                    <ul>
                      {
                        ingredients.map((x, i) =>
                          <ListItem
                            key={x + i}
                            index={i}
                            text={x}
                            update={(index, content) => this.update('ingredients', index, content, 'ingredients')}
                            delete={(index) => this.delete('ingredients', index)}
                          />
                        )
                      }
                    </ul>
                    <form onSubmit={ (e) => {
                      e.preventDefault()
                      if (ingredient === '') return
                      this.addIngredient(e)
                    }
                    }>
                    <div className="field">
                      <div className="control">
                        <input
                          onChange={ (e) => this.handleInputChange(e) }
                          value={ ingredient }
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
                          disabled={ ingredient === '' }
                          className="button is-primary"
                          type="button"
                          name="add ingredient"
                          value="Add"/>
                      </p>
                      <p className="control">
                        <input
                          onClick={ () => this.cancelAddIngredient() }
                          className={ ingredient === '' ? 'is-hidden button' : 'button' }
                          type="button"
                          disabled={ ingredient === '' }
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
                          <div key={step + i}>
                            <label className="label">Step { i + 1}</label>
                            <ListItem
                              index={i}
                              text={step}
                              update={(index, content) => this.update('steps', index, content)}
                              delete={(index) => this.delete('steps', index)}
                            />
                          </div>
                        )
                      }
                    </ul>
                    <form onSubmit={ (e) => {
                      e.preventDefault()
                      if (step === '') return
                      this.addStep()
                    }}>
                    <div className="field">
                      <label className="label">Step { steps.length + 1 }</label>
                      <div className="control">
                        <textarea
                          onChange={ (e) => this.handleInputChange(e) }
                          onKeyPress={ (e) => {
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
                          onClick={ () => this.addStep() }
                          disabled={ step === '' }
                          className="button is-primary"
                          type="submit"
                          name="save step"
                          value="Add"/>
                      </p>
                      <p className="control">
                        <input
                          onClick={ () => this.cancelAddStep() }
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
                <input
                  className="button is-large is-primary"
                  type="submit"
                  onClick={ (e) => this.handleSubmit(e) }
                  onKeyPress={ (e) => this.handleSubmit(e) }
                  name="cancel ingredient"
                  value="Create Recipe"/>
              </p>
            </div>
        </section>
      </div>
    )
  }
}

AddRecipe.PropTypes = {
  addRecipe: PropTypes.func.isRequired,
}

export default AddRecipe
