import React from 'react'
import { Link } from 'react-router-dom'

const toURL = (x = '') => x.replace(/\s/g, '-')

export const recipeURL = (id, name) => `/recipes/${id}-${toURL(name)}`

const RecipeItem = ({
    tags = {},
    url,
    source,
    name,
    author,
    id,
    inCart,
    removeFromCart,
    removingFromCart = false,
    addToCart,
    addingToCart = false
  }) => {
  const spanTags = tags.length > 0
    ? tags.map(tag => <span key={ tag } className="tag is-medium">{ tag }</span>)
    : null
  const buttons = (
    <div className="field is-grouped">
      <button
        onClick={ () => removeFromCart(id) }
        className={ `my-button control ${removingFromCart ? 'is-loading' : ''}` }
        disabled={ !inCart }>Remove One</button>
      <button
        onClick={ () => addToCart(id) }
        className={ `my-button is-primary control ${addingToCart ? 'is-loading' : ''}` }
        >Add Another</button>
      <span className="tag is-light is-medium cart-count-tag">{ inCart }</span>
    </div>
  )

  if (url == null) {
    url = recipeURL(id, name)
  }

  return (
    <div className="card ">
      <div className="card-content">
        <p className="title">
          <Link to={ url }>{ name }</Link>
        </p>
        <p className="subtitle">
          { author }
        </p>
        <div className="content">
          { spanTags }
        </div>

      </div>
      <footer className="card-footer">
        <div className="card-footer-item">{ buttons }</div>
      </footer>
    </div>
  )
}

export default RecipeItem
