export const recipes = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_RECIPE':
      return Object.assign({}, state, {[action.recipe.id]: action.recipe})
    case 'REMOVE_RECIPE':
      return Object.assign({}, state, {[action.id]: undefined})
    default:
      return state
  }
}

export default recipes
