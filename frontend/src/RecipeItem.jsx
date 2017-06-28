import React from 'react'
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

export default RecipeItem
