import {
  ADD_RECIPE,
  DELETE_RECIPE,
  ADD_STEP_TO_RECIPE,
  ADD_INGREDIENT_TO_RECIPE,
  UPDATE_RECIPE_NAME,
  DELETE_INGREDIENT,
  UPDATE_INGREDIENT,
  DELETE_STEP,
  UPDATE_RECIPE_SOURCE,
  UPDATE_RECIPE_AUTHOR,
  UPDATE_RECIPE_TIME,
  SET_RECIPES,
  UPDATE_STEP,
  SET_RECIPE_ADDING_TO_CART,
  SET_RECIPE_REMOVING_FROM_CART,
  SET_LOADING_ADD_STEP_TO_RECIPE,
  SET_LOADING_RECIPE,
  SET_DELETING_RECIPE,
  SET_ADDING_INGREDIENT_TO_RECIPE,
  SET_UPDATING_INGREDIENT,
  SET_REMOVING_INGREDIENT,
  SET_UPDATING_STEP,
  SET_REMOVING_STEP,
  SET_RECIPE_404,
  SET_RECIPE_UPDATING,
  SET_RECIPE,
  SET_RECIPE_CART_AMOUNT,
  CLEAR_RECIPE_CART_AMOUNTS,
  UPDATE_RECIPE_OWNER,
  SET_SCHEDULING_RECIPE,
} from '../actionTypes'

export const recipes = (state = {}, action) => {
  switch (action.type) {
  case ADD_RECIPE:
    return { ...state, [action.recipe.id]: action.recipe }
  case DELETE_RECIPE:
    return { ...state, [action.id]: undefined }
  case ADD_STEP_TO_RECIPE:
    return { ...state,
      [action.id]: {
        ...state[action.id],
        steps: [...state[action.id].steps, action.step]
      }
    }
  case SET_LOADING_ADD_STEP_TO_RECIPE:
    return { ...state,
      [action.id]: {
        ...state[action.id],
        addingStepToRecipe: action.val
      }
    }
  case SET_RECIPE_404:
    return { ...state,
      [action.id]: {
        ...state[action.id],
        error404: action.val
      }
    }
  case ADD_INGREDIENT_TO_RECIPE:
    return { ...state,
      [action.id]: {
        ...state[action.id],
        ingredients: [...state[action.id].ingredients, action.ingredient]
      }
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
      [action.recipeID]: {
        ...state[action.recipeID],
        ingredients: state[action.recipeID].ingredients.filter(x => x.id !== action.ingredientID)
      }
    }
  case UPDATE_INGREDIENT:
    return { ...state,
      [action.recipeID]: {
        ...state[action.recipeID],
        ingredients: state[action.recipeID].ingredients.map(ingre => {
          if (ingre.id === action.ingredientID) {
            return { ...ingre, ...action.content }
          } else {
            return ingre
          }
        })
      }
    }
  case DELETE_STEP:
    return { ...state,
      [action.recipeID]: {
        ...state[action.recipeID],
        steps: state[action.recipeID].steps.filter(x => x.id !== action.stepID)
      }
    }
  case UPDATE_STEP:
    return { ...state,
      [action.recipeID]: {
        ...state[action.recipeID],
        steps: state[action.recipeID].steps.map(s => {
          if (s.id === action.stepID) {
            return { ...s, text: action.text }
          } else {
            return s
          }
        })
      }
    }
  case SET_RECIPES:
      // convert the array of objects to an object with the recipe.id as the
      // key, and the recipe as the value
    return action.recipes.reduce((a, b) => ({ ...a, [b.id]: b }), {})
  case SET_RECIPE_ADDING_TO_CART:
    return { ...state, [action.id]: { ...state[action.id], addingToCart: action.loading } }
  case SET_RECIPE_REMOVING_FROM_CART:
    return { ...state, [action.id]: { ...state[action.id], removingFromCart: action.loading } }
  case SET_DELETING_RECIPE:
    return { ...state, [action.id]: { ...state[action.id], deleting: action.val } }
  case SET_LOADING_RECIPE:
    return { ...state, [action.id]: { ...state[action.id], loading: action.val } }
  case SET_ADDING_INGREDIENT_TO_RECIPE:
    return { ...state, [action.id]: { ...state[action.id], addingIngredient: action.val } }
  case SET_UPDATING_INGREDIENT:
    return {
      ...state,
      [action.recipeID]: {
        ...state[action.recipeID],
        ingredients: state[action.recipeID].ingredients.map(x => {
          if (x.id === action.ingredientID) {
            return {
              ...x,
              updating: action.val
            }
          }
          return x
        })
      }
    }
  case SET_REMOVING_INGREDIENT:
    return {
      ...state,
      [action.recipeID]: {
        ...state[action.recipeID],
        ingredients: state[action.recipeID].ingredients.map(x => {
          if (x.id === action.ingredientID) {
            return {
              ...x,
              removing: action.val
            }
          }
          return x
        })
      }
    }
  case SET_UPDATING_STEP:
    return {
      ...state,
      [action.recipeID]: {
        ...state[action.recipeID],
        steps: state[action.recipeID].steps.map(x => {
          if (x.id === action.stepID) {
            return {
              ...x,
              updating: action.val
            }
          }
          return x
        })
      }
    }
  case SET_REMOVING_STEP:
    return {
      ...state,
      [action.recipeID]: {
        ...state[action.recipeID],
        steps: state[action.recipeID].steps.map(x => {
          if (x.id === action.stepID) {
            return {
              ...x,
              removing: action.val
            }
          }
          return x
        })
      }
    }
  case SET_RECIPE_UPDATING:
    return { ...state,
      [action.id]: {
        ...state[action.id],
        updating: action.val
      }
    }
  case SET_RECIPE:
    return { ...state,
      [action.id]: {
        ...state[action.id],
        ...action.data
      }
    }
  case SET_RECIPE_CART_AMOUNT:
    return {
      ...state,
      [action.id]: {
        ...state[action.id],
        cart_count: action.count
      }
    }
  case CLEAR_RECIPE_CART_AMOUNTS:
    return Object.values(state)
        .reduce((result, recipe) => {
          result[recipe.id] = {
            ...recipe,
            cart_count: 0
          }
          return result
        }, {})
  case UPDATE_RECIPE_OWNER:
    return {
      ...state,
      [action.id]: {
        ...state[action.id],
        owner: action.owner
      }
    }
  case SET_SCHEDULING_RECIPE:
    return {
      ...state,
      [action.recipeID]: {
        ...state[action.recipeID],
        scheduling: action.scheduling,
      }
    }
  default:
    return state
  }
}

export default recipes
