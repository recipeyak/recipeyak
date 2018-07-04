import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'

import NoMatch from './NoMatch'
import Loader from './Loader'
import AddStep from './AddStep'
import AddIngredient from './AddIngredient'
import StepContainer from './StepContainer'
import Ingredient from './Ingredient'
import RecipeTitle from './RecipeTitle'

import {
  addingRecipeIngredient,
  addingRecipeStep,
  fetchRecipe,
  deletingRecipe,
  updateRecipe,
  deletingIngredient,
  updatingIngredient,
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
  updateIngredient: (recipeID, ingredientID, content) => dispatch(updatingIngredient(recipeID, ingredientID, content)),
  removeIngredient: (recipeID, ingredientID) => dispatch(deletingIngredient(recipeID, ingredientID)),
})

@connect(
  mapStateToProps,
  mapDispatchToProps
)
export default class Recipe extends React.Component {
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
    last_scheduled: PropTypes.string,
  }

  // necessary as these are undefined between page load and data fetch
  static defaultProps = {
    id: 0,
    name: '',
    author: '',
    source: '',
    servings: '',
    time: '',
    deleting: false,
    removing: false,
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

  state = {
    show: false,
    addStep: false,
    addIngredient: false,
  }

  componentWillMount () {
    this.props.fetchRecipe(this.props.match.params.id)
  }

  render () {
    const {
      id,
      name,
      ingredients,
      steps,
      loading,
      error404,
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

      <RecipeTitle
        id={this.props.id}
        name={this.props.name}
        author={this.props.author}
        source={this.props.source}
        servings={this.props.servings}
        time={this.props.time}
        owner={this.props.owner}
        lastScheduled={this.props.last_scheduled}
        update={this.props.update}
        updating={this.props.updating}
        remove={this.props.remove}
        deleting={this.props.deleting}
      />
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
                  update={ (ingredient) => this.props.updateIngredient(this.props.id, id, ingredient) }
                  remove={ () => this.props.removeIngredient(this.props.id, id) }
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
              : <a className="text-muted" onClick={() => this.setState({ addIngredient: true })}>add</a>
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
              : <a className="text-muted" onClick={() => this.setState({ addStep: true })}>add</a>
          }
        </div>
      </section>
    </div>
    )
  }
}
