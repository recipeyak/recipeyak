import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import NoMatch from './NoMatch'
import Loader from './Loader'
import { Helmet } from 'react-helmet'
import MetaData from './MetaData'
import { Button, ButtonPrimary } from './Buttons'
import DatePickerForm from './DatePickerForm'
import AddStep from './AddStep'
import AddIngredient from './AddIngredient'

import StepContainer from './StepContainer'
import Ingredient from './Ingredient'

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
  deleteRecipe: id => dispatch(deletingRecipe(id)),
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

class RecipeTitle extends React.Component {
  state = {
    show: false,
    edit: false,
    recipe: {

    }
  }

  toggleEdit = () => this.setState(prev => ({ edit: !prev.edit }))

  handleSave = () => {
    const data = this.state.recipe
    this.props.update(this.props.id, data).then(() => {
      this.setState({edit: false})
    })
  }


  handleInputChange = e => {
    e.persist()
    this.setState(prevState => ({
      recipe: {
        ...prevState.recipe,
        [e.target.name]: e.target.value
      }
    }))
  }

  handleDelete = () => {
    console.log('delete', this.props.recipe)
  }

  render () {
    const {
      id,
      name,
      author,
      source,
      servings,
      time,
      owner = {
        type: 'user',
        id: 0,
        name: '',
      },
      update,
      updating,
    } = this.props
    return (
      <div>
        <div className="grid-entire-row d-flex justify-space-between p-rel">
          { !this.state.edit
              ?
                  <div className="d-flex align-items-center">
                    <h1 className="title fs-3rem mb-0 cursor-pointer" onClick={this.toggleEdit}>{ name }</h1>
                  </div>
            : <input
                  className="my-input fs-2rem mb-4"
                  type="text"
                  autoFocus
                  placeholder="new recipe title"
                  onChange={ this.handleInputChange }
                  defaultValue={ name }
                  name="name"/>
                }
                <div>
          <div className="p-rel ml-4">
            <ButtonPrimary onClick={() => this.setState(prev => ({ show: !prev.show }))} className="is-small">
              schedule
            </ButtonPrimary>
            <DatePickerForm
              recipeID={id}
              show={this.state.show}
              close={() => this.setState({ show: false })}
            />
          </div>
          </div>
        </div>

        { !this.state.edit ?
      <div className="grid-entire-row">
        <MetaData
          onClick={this.toggleEdit}
          owner={owner}
          name={name}
          author={author}
          source={source}
          servings={servings}
          recipeId={id}
          time={time}/>
      </div>


            :
      <div className="d-grid grid-entire-row align-items-center meta-data-grid">
        <label className="d-flex align-center">By
          <input
            className="my-input ml-2"
            type="text"
            placeholder="Author"
            defaultValue={ author }
            onChange={ this.handleInputChange }
            name="author"/>
        </label>
        <label className="d-flex align-center">from
          <input
            className="my-input ml-2"
            type="text"
            placeholder="http://example.com/dumpling-soup"
            defaultValue={ source }
            onChange={ this.handleInputChange }
            name="source"/>
        </label>
        <label className="d-flex align-center">creating
          <input
            className="my-input ml-2"
            type="text"
            placeholder="4 to 6 servings"
            defaultValue={ servings }
            onChange={ this.handleInputChange }
            name="servings"/>
        </label>
        <label className="d-flex align-center">in
          <input
            className="my-input ml-2"
            type="text"
            placeholder="1 hour"
            defaultValue={ time }
            onChange={ this.handleInputChange }
            name="time"/>
        </label>

        <div>
          <Button
            className="is-small ml-2"
            type="submit"
            loading={updating}
            onClick={this.handleDelete}
            name="delete recipe" >
            Delete
          </Button>
          <Button
            className="is-small ml-2"
            type="submit"
            loading={updating}
            onClick={this.handleSave}
            name="save recipe" >
            Save
          </Button>
          <input
            className='my-button is-small ml-2'
            type="button"
            name="cancel recipe update"
            onClick={this.toggleEdit}
            value="Cancel"/>
        </div>
      </div>
        }
      </div>
    )
  }
}
