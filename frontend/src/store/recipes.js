// We are expecting the state to be in the following format:
// {
//  ID: RECIPE_OBJECT,
//  1: {
//    name: 'Curried Roast Chicken, Durban Style',
//    url: '/recipes/:id/'
//    version: 1.0,
//    updated: 1979-05-27T07:32:00Z,
//    source: 'url',
//    tags: ['foo', 'bar'],
//    ingredients = ['30g foo', '15ml bar'],
//    steps = ['Add foo and bar to pot']
//  }
// }

export const recipes = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_RECIPE':
      return Object.assign({}, state, { [action.recipe.id]: action.recipe })
    case 'REMOVE_RECIPE':
      return Object.assign({}, state, { [action.id]: undefined })
    case 'ADD_STEP_TO_RECIPE':
      const newSteps = [...state[action.id].steps, action.step]
      const newRecipe = Object.assign({}, action.id, { steps: newSteps })
      return Object.assign({}, state, { [action.id]: newRecipe })
    case 'ADD_INGREDIENT_TO_RECIPE':
      const newIngredients = [...state[action.id].ingredients, action.step]
      return Object.assign({}, state, {
        [action.id]: Object.assign({}, action.id, {
          ingredients: newIngredients,
        }),
      })
    default:
      return state
  }
}

export default recipes
