import React from 'react'
import {PropTypes} from 'prop-types'

const Ingredients = props => {
  const ingredientList = props.ingredients.reduce((acc, val) => (acc + <li>{val}</li>))
  return (<ul>{ ingredientList }</ul>)
}

Ingredients.PropTypes = {
  ingredients: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default Ingredients
