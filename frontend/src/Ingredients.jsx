import React from 'react'
import {PropTypes} from 'prop-types'

const Ingredients = props => {
  const ingredientList = props.ingredients.map(val => (<li key={val}>{val}</li>))
  return (<ul>{ ingredientList }</ul>)
}

Ingredients.PropTypes = {
  ingredients: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default Ingredients
