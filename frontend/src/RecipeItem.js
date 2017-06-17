import React from 'react'

class RecipeItem extends React.Component {
  addToCart (recipe_id) {
    console.log(`Clicked recipe with id: ${recipe_id}`)
  }
  render () {
    const tags = this.props.tags.map(tag => <span key={ tag } className="tag">{ tag }</span>)
    return (
        <div className="card ">
          <div className="card-content">
            <p className="title"><a href={ this.props.url }>{ this.props.title }</a></p>
            <p className="subtitle"><a href={ this.props.source }>{ this.props.author }</a></p>
            <div className="content">{ tags }</div>
          </div>
          <footer className="card-footer">
            <p className="card-footer-item">
              <button onClick={ () => this.addToCart(this.props.id) } className="button is-primary">Add to Cart</button>
            </p>
          </footer>
        </div>
    )
  }
}

export default RecipeItem
