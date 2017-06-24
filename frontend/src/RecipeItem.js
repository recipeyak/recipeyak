import React from 'react'

const RecipeItem = props => {
  const tags = props.tags.map(tag => <span key={ tag } className="tag">{ tag }</span>)

  const button = props.inCart ? (
    <button
      onClick={ () => props.addToCart(props.id) }
      className="button is-primary">Remove from cart</button>) : (
    <button
      onClick={ () => props.addToCart(props.id) }
      className="button is-primary">Add to Cart</button>)

  return (
      <div className="card ">
        <div className="card-content">
          <p className="title"><a href={ props.url }>{ props.title }</a></p>
          <p className="subtitle"><a href={ props.source }>{ props.author }</a></p>
          <div className="content">{ tags }</div>
        </div>
        <footer className="card-footer">
          <p className="card-footer-item">{ button }</p>
        </footer>
      </div>
  )
}

export default RecipeItem
