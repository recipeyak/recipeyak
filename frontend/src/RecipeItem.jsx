import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const RecipeItem = props => {
  const tags = props.tags.map(tag => <span key={ tag } className="tag">{ tag }</span>)

  const button = (
    <div className="field is-grouped">
      <button
      onClick={ () => props.removeFromCart(props.id) }
      className="button control" disabled={props.inCart === 0}>Remove from cart</button>
      <button
      onClick={ () => props.addToCart(props.id) }
      className="button is-primary control">Add to Cart ({props.inCart})</button>
    </div>)

  return (
      <div className="card ">
        <div className="card-content">
          <p className="title"><Link to={ props.url }>{ props.title }</Link></p>
          <p className="subtitle"><a href={ props.source }>{ props.author }</a></p>
          <div className="content">{ tags }</div>
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
