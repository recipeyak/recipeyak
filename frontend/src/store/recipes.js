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
//

import {
  ADD_RECIPE,
  REMOVE_RECIPE,
  ADD_STEP_TO_RECIPE,
  ADD_INGREDIENT_TO_RECIPE,
  UPDATE_RECIPE_NAME,
} from './actionTypes.js'

export const recipes = (state = {}, action) => {
  switch (action.type) {
    case ADD_RECIPE:
      return Object.assign({}, state, { [action.recipe.id]: action.recipe })
    case REMOVE_RECIPE:
      return Object.assign({}, state, { [action.id]: undefined })
    case ADD_STEP_TO_RECIPE:
      const newSteps =
        [...state[action.id].steps, action.step]

      const newRecipe =
        Object.assign({}, state[action.id], {
          steps: newSteps,
        })

      return Object.assign({}, state, { [action.id]: newRecipe })
    case ADD_INGREDIENT_TO_RECIPE:

      const updatedIngredients =
        [...state[action.id].ingredients, action.ingredient]

      const updatedRecipe =
        Object.assign({}, state[action.id], {
          ingredients: updatedIngredients,
        })

      return Object.assign({}, state, { [action.id]: updatedRecipe })
    case UPDATE_RECIPE_NAME:
      return Object.assign({}, state, {
        [action.id]: Object.assign({}, state[action.id], {
          name: action.name,
        }),
      })
    default:
      return state
  }
}

export default recipes
