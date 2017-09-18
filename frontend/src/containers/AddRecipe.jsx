import { connect } from 'react-redux'

import { postNewRecipe } from '../store/actions.js'
import AddRecipe from '../components/AddRecipe.jsx'

const mapDispatchToProps = dispatch => {
  return {
    addRecipe: recipe => {
      dispatch(postNewRecipe(recipe))
    },
  }
}

const ConnectedAddRecipe = connect(
  null,
  mapDispatchToProps,
)(AddRecipe)

export default ConnectedAddRecipe
