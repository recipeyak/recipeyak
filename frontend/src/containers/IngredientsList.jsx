import { connect } from 'react-redux'

import Ingredients from '../IngredientsList.jsx'

const mapStateToProps = state => {
  const { recipes, cart } = state
  const cartRecipes = Object.keys(cart).map(recipeID => recipes[recipeID])
  return {
    recipes: cartRecipes,
  }
}

const ConnectedIngredients = connect(
  mapStateToProps,
)(Ingredients)

export default ConnectedIngredients
