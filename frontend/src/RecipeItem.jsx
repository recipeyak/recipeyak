import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const RecipeItem = ({
    tags = {},
    url,
    source,
    name,
    author,
    id,
    inCart,
    removeFromCart,
    addToCart,
  }) => {
  const spanTags = tags.length > 0
    ? tags.map(tag => <span key={ tag } className="tag is-medium">{ tag }</span>)
    : null
  const buttons = (
    <div className="field is-grouped">
      <button
        onClick={ () => removeFromCart(id) }
        className="button control"
        disabled={ !inCart }>Remove One</button>
      <button
        onClick={ () => addToCart(id) }
        className="button is-primary control"
        >Add Another</button>
      <span className="tag is-light is-medium cart-count-tag">{ inCart }</span>
    </div>
  )

  return (
    <div className="card ">
      <div className="card-content">
        <p className="title">
          <Link to={ url }>{ name }</Link>
        </p>
        <p className="subtitle">
          <a href={ source }>{ author }</a>
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

RecipeItem.PropTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  source: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string),
  inCart: PropTypes.number.isRequired,
  removeFromCart: PropTypes.func.isRequired,
  addToCart: PropTypes.func.isRequired,
}

export default RecipeItem
