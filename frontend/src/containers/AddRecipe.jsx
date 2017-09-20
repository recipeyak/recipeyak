import { connect } from 'react-redux'

import { postNewRecipe } from '../store/actions.js'
import AddRecipe from '../components/AddRecipe.jsx'

const mapStateToProps = state => {
  return {
    loading: state.loading.addRecipe,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addRecipe: recipe => {
      dispatch(postNewRecipe(recipe))
    },
  }
}

const ConnectedAddRecipe = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddRecipe)

export default ConnectedAddRecipe
