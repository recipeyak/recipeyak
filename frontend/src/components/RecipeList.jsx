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
      Object.values(this.props.recipes)
      .map(recipe =>
        <div className="grid-item" key={ recipe.id }>
          <Recipe
            {...recipe}
            url={ '/recipes/' + recipe.id }
            inCart={ this.props.cart[recipe.id] > 0 ? this.props.cart[recipe.id] : 0 }
            key={ recipe.id }
            removeFromCart={ () => this.props.removeFromCart(recipe.id)}
            addToCart={ () => this.props.addToCart(recipe.id)}
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
