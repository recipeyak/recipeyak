import React from 'react'
import {PropTypes} from 'prop-types'

const Ingredients = props => {
  const ingredientList = props.ingredients.length > 0 ? props.ingredients.map(val => (<li key={val}>{val}</li>)) : 'No ingredients'

  return (<ul>{ ingredientList }</ul>)
}

Ingredients.defaultProps = {
  ingredients: [],
}

Ingredients.PropTypes = {
  ingredients: PropTypes.arrayOf(PropTypes.string),
}

export default Ingredients
