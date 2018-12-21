import { connect } from "react-redux"

import { updatingPassword, setErrorPasswordUpdate } from "../store/actions"

import PasswordChange from "../components/PasswordChange"

const mapDispatchToProps = dispatch => ({
  update: (oldPassword, password1, password2) =>
    dispatch(updatingPassword(password1, password2, oldPassword)),
  clearErrors: () => dispatch(setErrorPasswordUpdate({}))
})

const mapStateToProps = state => ({
  loading: state.passwordChange.loadingPasswordUpdate,
  error: state.passwordChange.errorPasswordUpdate
})

const ConnectedPasswordChange = connect(
  mapStateToProps,
  mapDispatchToProps
)(PasswordChange)

export default ConnectedPasswordChange
