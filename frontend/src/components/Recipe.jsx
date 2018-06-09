import React from 'react'

import { connect } from 'react-redux'

import {
  fetchRecipe,
  deletingRecipe,
} from '../store/actions'


import RecipeViewing from './RecipeViewing'

import { inputAbs } from '../input'

const mapStateToProps = (state, props) => {
  const id = props.match.params.id
  return state.recipes[id] ? state.recipes[id] : {}
}

const mapDispatchToProps = dispatch => ({
  fetchRecipe: id => dispatch(fetchRecipe(id)),
  deleteRecipe: id => dispatch(deletingRecipe(id)),
})

@connect(
  mapStateToProps,
  mapDispatchToProps
)
export default class Recipe extends React.Component {

  componentWillMount () {
    this.props.fetchRecipe(this.props.match.params.id)
  }

  render () {
    return (
      <RecipeViewing
        { ...this.props }
      />
    )
  }
}
