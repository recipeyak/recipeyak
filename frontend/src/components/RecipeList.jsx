import React from 'react'
import PropTypes from 'prop-types'

import Base from './Base.jsx'
import Recipe from './RecipeItem.jsx'

import 'bulma/css/bulma.css'

import './recipe-list.scss'

class RecipeList extends React.Component {
  componentWillMount () {
    this.props.fetchRecipeList()
  }

  render () {
    if (this.props.error) return <Base><p>Error fetching data</p></Base>

    if (this.props.loading) return <Base><p>Loading...</p></Base>

    const recipes =
      Object.entries(this.props.recipes)
      .map(([ recipeID, recipe ]) =>
        <div className="grid-item" key={ recipeID }>
          <Recipe
            {...recipe}
            url={ '/recipe/' + recipeID }
            inCart={ this.props.cart[recipeID] > 0 ? this.props.cart[recipeID] : 0 }
            key={ recipeID }
            removeFromCart={ () => this.props.removeFromCart(recipeID)}
            addToCart={ () => this.props.addToCart(recipeID)}
          />
        </div>)

    const recipeList = recipes.length !== 0
      ? <div className="grid-container">{ recipes }</div>
      : <div className="no-recipes">No Recipes☹️</div>

    return (
      <Base>
        { recipeList }
      </Base>
    )
  }
}

RecipeList.PropTypes = {
  removeFromCart: PropTypes.func.isRequired,
  addToCart: PropTypes.func.isRequired,
  fetchRecipeList: PropTypes.func.isRequired,
  cart: PropTypes.object,
  recipes: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.bool,
}

RecipeList.defaultProps = {
  cart: {},
  recipes: {},
}

export default RecipeList
