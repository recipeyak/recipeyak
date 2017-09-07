import React from 'react'
import PropTypes from 'prop-types'

const flatten = arr => arr.reduce(
  (acc, val) => acc.concat(
    Array.isArray(val) ? flatten(val) : val
  ),
  []
)

// flatten function used inside reduce functions
const reduceFlatten = (acc, val) =>
  acc.concat(
    Array.isArray(val)
    ? flatten(val)
    : val
  )

const countDupes = (acc, b) => {
  if (acc[b] == null) {
    acc[b] = 1
  } else {
    acc[b]++
  }
  return acc
}

const expandOccurances = rec => {
  const occurs = rec.inCart
  const output = []
  for (let i = 0; i < occurs; i++) {
    output.push(rec.ingredients)
  }
  return output
}

export const combineRecipeIngredients = (recipes) => {
  const recipesObject = recipes
    .map(expandOccurances)
    .reduce(reduceFlatten, [])
    .reduce(countDupes, {})

  return Object.keys(recipesObject)
    .map(key => ({ ingredient: key, occurs: recipesObject[key] }))
    .sort((a, b) => a.ingredient > b.ingredient)
}

const IngredientsList = ({ recipes = [] }) => {
  const ingredients =
    combineRecipeIngredients(recipes)
    .map(ingredient => {
      const occurs = ingredient.occurs > 1 && ingredient.occurs + 'x '
      return (
        <li key={ ingredient.ingredient }>
          { occurs }{ ingredient.ingredient }
        </li>
      )
    }
    )
  return (
    <ul className="ingredients-list content">
      { ingredients }
    </ul>
  )
}

IngredientsList.PropTypes = {
  recipes: PropTypes.array.isRequired,
}

export default IngredientsList
