import { connect } from 'react-redux'

import { addRecipe } from '../store/actions.js'
import AddRecipe from '../components/AddRecipe.jsx'

const mapDispatchToProps = dispatch => {
  return {
    addRecipe: recipe => {
      dispatch(addRecipe(recipe))
    },
  }
}

const ConnectedAddRecipe = connect(
  null,
  mapDispatchToProps,
)(AddRecipe)

export default ConnectedAddRecipe
