import { connect } from 'react-redux'

import {
  postNewRecipe,
  setErrorAddRecipe
} from '../store/actions.js'
import AddRecipe from '../components/AddRecipe.jsx'

const mapStateToProps = state => {
  return {
    loading: state.loading.addRecipe,
    error: state.error.addRecipe
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addRecipe: recipe => {
      dispatch(postNewRecipe(recipe))
    },
    clearErrors: () => {
      dispatch(setErrorAddRecipe({}))
    }
  }
}

const ConnectedAddRecipe = connect(
  mapStateToProps,
  mapDispatchToProps
)(AddRecipe)

export default ConnectedAddRecipe
