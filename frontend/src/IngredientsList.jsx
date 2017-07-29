import React from 'react'
import PropTypes from 'prop-types'

import { combineRecipeIngredients } from './helpers.js'

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
