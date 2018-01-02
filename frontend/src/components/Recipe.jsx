import React from 'react'
import { Helmet } from 'react-helmet'

import Loader from './Loader.jsx'
import RecipeEdit from '../containers/RecipeEdit'

const MetaData = ({
  author = '',
  source = '',
  servings = '',
  time = ''
}) => {
  const isValid = x => x !== '' && x != null

  const _author = isValid(author)
    ? <span>By <b>{author}</b> </span>
    : null
  const _source = isValid(source)
    ? <span>from <b>{source}</b> </span>
    : null
  const _servings = isValid(servings)
    ? <span>creating <b>{servings}</b> </span>
    : null
  const _time = isValid(time)
    ? <span>in <b>{time}</b> </span>
    : null

  return <p>{ _author }{ _source }{ _servings }{ _time }</p>
}

const RecipeViewing = ({
  id,
  name,
  author,
  source,
  servings,
  time,
  ingredients = [],
  steps = [],
  inCart = 0,
  addToCart,
  removeFromCart,
  addingToCart = false,
  removingFromCart = false,
  loading = false,
  error404 = false,
  edit
}) => {
  if (error404) {
    return <p>404</p>
  }
  if (loading) {
    return <section className="d-flex justify-content-center">
      <Loader/>
    </section>
  }
  return (
    <div className="d-grid grid-gap-1rem">
      <Helmet title={ name }/>

      <div className="grid-entire-row d-flex align-center justify-space-between">
        <h1 className="title fs-3rem mb-0">{ name }</h1>
        <div className="d-flex">
          <div className="d-flex">
            <input
              onClick={ () => removeFromCart(id) }
              className={ `my-button ${removingFromCart ? 'is-loading' : ''}` }
              disabled={ inCart <= 0 }
              type="button"
              value="-"/>
            <span className="bg-whitesmoke height-100 min-width-2rem d-flex align-center justify-content-center">{ inCart }</span>
            <input
              onClick={ () => addToCart(id) }
              className={ `my-button is-primary ${addingToCart ? 'is-loading' : ''}` }
              type="button"
              value="+"/>
          </div>
        </div>
      </div>

      <div className="grid-entire-row">
        <MetaData
          name={name}
          author={author}
          source={source}
          servings={servings}
          time={time}/>
      </div>

      <section className="ingredients-preparation-grid">
        <div>
          <h2 className="title is-3 mb-4">Ingredients</h2>
          <ul>
            {
              ingredients.map(({ id, quantity, name, description }) =>
                <p key={ id } className="listitem-text justify-space-between">
                  { quantity } { name } { description }
                </p>
              )
            }
          </ul>
        </div>

        <div >
          <h2 className="title is-3 mb-4">Preparation</h2>
          <ul>
            {
              steps.map(({ id, text }, i) =>
              <div key={id}>
                <label className="better-label">Step { i + 1}</label>
                <p className="listitem-text mb-2">{ text }</p>
              </div>

              )
            }
          </ul>
        </div>
      </section>

      <section className="d-flex justify-content-center grid-entire-row">
        <button
          onClick={ edit }
          className="my-button is-link">
          Edit
        </button>
      </section>
    </div>
  )
}

class Recipe extends React.Component {
  state = {
    editing: false
  }

  componentWillMount = () => {
    this.props.fetchRecipe(this.props.match.params.id)
  }

  render () {
    if (this.state.editing) {
      return (
        <RecipeEdit
          { ...this.props }
          cancelEdit={ () => this.setState({ editing: false }) }
        />
      )
    }
    return (
      <RecipeViewing
        { ...this.props }
        edit={ () => this.setState({ editing: true }) }
      />
    )
  }
}

export default Recipe
