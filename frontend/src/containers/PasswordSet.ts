import { connect, Dispatch } from 'react-redux'

import { StateTree } from '../store/store'

import {
  updatingPassword,
  setErrorPasswordUpdate
} from '../store/actions'

import PasswordChange from '../components/PasswordChange'

const mapDispatchToProps = (dispatch: Dispatch<StateTree>) => ({
  update: (oldPassword: string, password1: string, password2: string) => {
    dispatch(updatingPassword(password1, password2, oldPassword))
  },
  clearErrors: () => dispatch(setErrorPasswordUpdate({}))
})

const mapStateToProps = (state: StateTree) => ({
  loading: state.passwordChange.loadingPasswordUpdate,
  setPassword: true,
  error: state.passwordChange.errorPasswordUpdate
})

const ConnectedPasswordChange = connect<{},{},{}>(
  mapStateToProps,
  mapDispatchToProps
)(PasswordChange)

export default ConnectedPasswordChange
