import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const RecipeItem = ({ tags, url, source, title, author, id, inCart, removeFromCart, addToCart }) => {
  const spanTags = tags.map(tag => <span key={ tag } className="tag">{ tag }</span>)

  const button = (
    <div className="field is-grouped">
      <button
        onClick={ () => removeFromCart(id) }
        className="button control" disabled={inCart === 0}>Remove from cart</button>
      <button
        onClick={ () => addToCart(id) }
        className="button is-primary control">Add to Cart ({ inCart })</button>
    </div>
  )

  return (
    <div className="card ">
      <div className="card-content">
        <p className="title">
          <Link to={ url }>{ title }</Link>
        </p>
        <p className="subtitle">
          <a href={ source }>{ author }</a>
        </p>
        <div className="content">{ spanTags }</div>
      </div>
      <footer className="card-footer">
        <div className="card-footer-item">{ button }</div>
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
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  inCart: PropTypes.bool.isRequired,
  removeFromCart: PropTypes.func.isRequired,
  addToCart: PropTypes.func.isRequired,
}

export default RecipeItem
