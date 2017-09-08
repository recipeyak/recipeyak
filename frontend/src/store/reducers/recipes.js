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
  DELETE_INGREDIENT,
  DELETE_STEP,
  UPDATE_RECIPE_SOURCE,
  UPDATE_RECIPE_AUTHOR,
  UPDATE_RECIPE_TIME,
} from '../actionTypes.js'

export const recipes = (state = {}, action) => {
  switch (action.type) {
    case ADD_RECIPE:
      return { ...state, [action.recipe.id]: action.recipe }
    case REMOVE_RECIPE:
      return { ...state, [action.id]: undefined }
    case ADD_STEP_TO_RECIPE:
      return { ...state,
        [action.id]: {
          ...state[action.id],
          steps: [...state[action.id].steps, action.step],
        },
      }
    case ADD_INGREDIENT_TO_RECIPE:
      return { ...state,
        [action.id]: {
          ...state[action.id],
          ingredients: [...state[action.id].ingredients, action.ingredient],
        },
      }
    case UPDATE_RECIPE_NAME:
      return { ...state, [action.id]: { ...state[action.id], name: action.name } }
    case UPDATE_RECIPE_SOURCE:
      return { ...state, [action.id]: { ...state[action.id], source: action.source } }
    case UPDATE_RECIPE_TIME:
      return { ...state, [action.id]: { ...state[action.id], time: action.time } }
    case UPDATE_RECIPE_AUTHOR:
      return { ...state, [action.id]: { ...state[action.id], author: action.author } }
    case DELETE_INGREDIENT:
      return { ...state,
        [action.id]: {
          ...state[action.id],
          ingredients: state[action.id].ingredients.filter((_, index) => index !== action.index),
        },
      }
    case DELETE_STEP:
      return { ...state,
        [action.id]: {
          ...state[action.id],
          steps: state[action.id].steps.filter((_, index) => index !== action.index),
        },
      }
    default:
      return state
  }
}

export default recipes
