import React from 'react'

import RecipeEdit from '../containers/RecipeEdit'
import RecipeViewing from './RecipeViewing'

import { inputAbs } from '../input'

class Recipe extends React.Component {
  state = {
    editing: false,
  }

  handleInputChange = e =>
    this.setState({ [e.target.name]: inputAbs(e.target.value) })

  componentWillMount = () => {
    this.props.fetchRecipe(this.props.match.params.id)
  }

  render () {
    if (this.state.editing) {
      return (
        <RecipeEdit
          { ...this.props }
          cancelEdit={ () => this.setState({ editing: false }) }
        />
      )
    }
    return (
      <RecipeViewing
        { ...this.props }
        handleInputChange={ this.handleInputChange }
        edit={ () => this.setState({ editing: true }) }
      />
    )
  }
}

export default Recipe
