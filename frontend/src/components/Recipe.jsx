import React from 'react'

import ListItem from './ListItem.jsx'
import EnhancedTextInput from './EnhancedTextInput.jsx'
import AddIngredient from './AddIngredient.jsx'
import Ingredient from './Ingredient'
import AddStep from './AddStep.jsx'

import { units } from './constants'

import './AddRecipe.scss'
import './Recipe.scss'

class Recipe extends React.Component {
  componentWillMount = () => {
    this.props.fetchRecipe(this.props.match.params.id)
  }

  removeIngredient = ingredientID => {
    this.props.deleteIngredient(this.props.id, ingredientID)
  }

  deleteStep = stepID => {
    this.props.deleteStep(this.props.id, stepID)
  }

  updateIngredient = (ingredientID, content) => {
    this.props.updateIngredient(this.props.id, ingredientID, content)
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
    const {
      ingredients,
      steps,
      tags,
      name,
      author,
      source,
      time,
      addingStepToRecipe
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
                    ingredients.map(ingredient =>
                      <Ingredient
                        key={ ingredient.id }
                        id={ ingredient.id }
                        update={ this.updateIngredient }
                        remove={ this.removeIngredient }
                        quantity={ ingredient.quantity }
                        unit={ ingredient.unit }
                        units={ units }
                        name={ ingredient.name }
                        description={ ingredient.description }
                      />
                    )
                  }
                </ul>
                <AddIngredient
                  id={ this.props.id }
                  addIngredient={ this.props.addIngredient }
                />
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
                <AddStep
                  id={ this.props.id }
                  index={ steps.length + 1 }
                  addStep={ this.props.addStep }
                  loading={ addingStepToRecipe }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Recipe.defaultProps = {
  ingredients: [],
  steps: [],
  tags: [],
  recipe: {}
}

export default Recipe
