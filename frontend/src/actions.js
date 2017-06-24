export const addRecipeToCart = recipeId => {
  return {
    type: 'ADD_RECIPE_TO_CART',
    id: recipeId
  }
}

export const removeRecipeFromCart = recipeId => {
  return {
    type: 'REMOVE_RECIPE_FROM_CART',
    id: recipeId
  }
}
