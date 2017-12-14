import React from 'react'
import { Link } from 'react-router-dom'

const MetaData = ({
  author = '',
  source = '',
  servings = '',
  time = ''
}) => {
  const isValid = x => x !== '' && x != null

  const _author = isValid(author)
    ? `By ${author} `
    : ''
  const _source = isValid(source)
    ? `from ${source} `
    : ''
  const _servings = isValid(servings)
    ? `creating ${servings} `
    : ''
  const _time = isValid(time)
    ? `in ${time} `
    : ''

  return <p className="">{ _author + _source + _servings + _time }</p>
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
  error404 = false
}) => {
  if (error404) {
    return <p>404</p>
  }
  if (loading) {
    return <p>Loading...</p>
  }
  return (
    <div className="d-grid grid-template-columns-repeat-12-fr grid-gap-1rem">

      <div className="grid-entire-row d-flex align-center justify-space-between flex-wrap">
        <h1 className="title fs-3rem mb-0">{ name }</h1>
        <div className="d-flex">
          <div>
            <input
              onClick={ () => removeFromCart(id) }
              className={ `button ${removingFromCart ? 'is-loading' : ''}` }
              disabled={ inCart <= 0 }
              type="button"
              value="-"/>
            <span className="tag is-light is-medium cart-count-tag">{ inCart }</span>
            <input
              onClick={ () => addToCart(id) }
              className={ `button is-primary ${addingToCart ? 'is-loading' : ''}` }
              type="button"
              value="+"/>
          </div>
          <Link to={ `/recipes/${id}/edit` } className="button is-link ml-2">Edit</Link>
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
          <h2 className="title">Ingredients</h2>
          <div className="box">
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
        </div>

        <div >
          <h2 className="title is-3">Preparation</h2>
          <div className="box">
            <ul>
              {
                steps.map(({ id, text }, i) =>
                  <div key={id}>
                    <label className="label">Step { i + 1}</label>
                    <p className="listitem-text">text</p>
                  </div>

                )
              }
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

class Recipe extends React.Component {
  componentWillMount = () => {
    this.props.fetchRecipe(this.props.match.params.id)
  }

  render () {
    return <RecipeViewing
      { ...this.props }
    />
  }
}

export default Recipe
