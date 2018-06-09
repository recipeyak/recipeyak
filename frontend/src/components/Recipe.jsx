import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import NoMatch from './NoMatch'
import Loader from './Loader'
import { Helmet } from 'react-helmet'
import { Button, ButtonPrimary } from './Buttons'
import AddStep from './AddStep'
import AddIngredient from './AddIngredient'

import StepContainer from './StepContainer'
import Ingredient from './Ingredient'
import RecipeTitle from './RecipeTitle'

import {
  addingRecipeIngredient,
  addingRecipeStep,
  sendUpdatedRecipeName,
  deletingIngredient,
  deletingStep,
  setRecipeSource,
  setRecipeAuthor,
  setRecipeTime,
  fetchRecipe,
  updatingIngredient,
  updatingStep,
  deletingRecipe,
  updateRecipe
} from '../store/actions'

const mapStateToProps = (state, props) => {
  const id = props.match.params.id
  const recipe = state.recipes[id]
    ? state.recipes[id]
    : { loading: true }
  return recipe
}

const mapDispatchToProps = dispatch => ({
  fetchRecipe: id => dispatch(fetchRecipe(id)),
  addIngredient: (recipeID, ingredient) =>
    dispatch(addingRecipeIngredient(recipeID, ingredient)),
  addStep: (id, step) =>
    dispatch(addingRecipeStep(id, step)),
  update: (id, data) => dispatch(updateRecipe(id, data)),
  remove: id => dispatch(deletingRecipe(id)),
})

@connect(
  mapStateToProps,
  mapDispatchToProps
)
export default class RecipeViewing extends React.Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
    servings: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    ingredients: PropTypes.array.isRequired,
    steps: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    error404: PropTypes.bool.isRequired,
    owner: PropTypes.object.isRequired,
    update: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    deleting: PropTypes.bool.isRequired,
  }

  state = {
    show: false,
    addStep: false,
    addIngredient: false,
  }

  static defaultProps = {
    ingredients: [],
    steps: [],
    loading: true,
    error404: false,
    owner: {
      type: 'user',
      id: 0,
      name: '',
    },
    updating: false,
  }

  componentWillMount () {
    this.props.fetchRecipe(this.props.match.params.id)
  }

  render () {
    const {
      id,
      name,
      author,
      source,
      servings,
      time,
      ingredients,
      steps,
      loading,
      error404,
      owner,
    } = this.props
    if (error404) {
      return <NoMatch/>
    }
    if (loading) {
      return <section className="d-flex justify-content-center">
      <Loader/>
    </section>
    }
    return (
    <div className="d-grid grid-gap-2">
      <Helmet title={ name }/>

      <RecipeTitle {...this.props}/>
      <section className="ingredients-preparation-grid">
        <div>
          <h2 className="title is-3 mb-1 font-family-title bold">Ingredients</h2>
          <ul>
            {
              ingredients.map(({ id, quantity, name, description, optional, updating, removing }) =>
                <Ingredient
                  key={id}
                  recipeID={this.props.id}
                  id={id}
                  quantity={quantity}
                  name={name}
                  updating={updating}
                  removing={removing}
                  description={description}
                  optional={optional}
                />
              )
            }
          </ul>
          { this.state.addIngredient
              ? <AddIngredient
                  id={ id }
                  autoFocus
                  index={ ingredients.length + 1 }
                  addIngredient={this.props.addIngredient}
                  onCancel={() => this.setState({ addIngredient: false })}
                />
              : <a className="text-muted" onClick={() => this.setState({ addIngredient: true })}>add ingredient</a>
          }
        </div>

        <div>
          <h2 className="title is-3 mb-1 font-family-title bold">Preparation</h2>
          <StepContainer steps={steps} recipeID={id}/>
          { this.state.addStep
              ? <AddStep
                  id={ id }
                  index={ steps.length + 1 }
                  autoFocus
                  addStep={this.props.addStep}
                  onCancel={() => this.setState({ addStep: false })}
                  loading={this.props.addingStepToRecipe}
                />
              : <a className="text-muted" onClick={() => this.setState({ addStep: true })}>add step</a>
          }
        </div>
      </section>
    </div>
    )
  }
}
