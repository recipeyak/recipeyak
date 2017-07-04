import React from 'react'
import { PropTypes } from 'prop-types'

const Ingredients = ({ ingredients = [] }) => {
  const ingredientList = ingredients.length > 0
    ? ingredients.map(val => <li key={ val }>{ val }</li>)
    : 'No ingredients'

  return <ul>{ ingredientList }</ul>
}

Ingredients.PropTypes = {
  ingredients: PropTypes.arrayOf(PropTypes.string),
}

export default Ingredients
