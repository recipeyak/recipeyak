import { connect } from "react-redux"

import {
  updatingPassword,
  setErrorPasswordUpdate,
  Dispatch
} from "../store/actions"

import PasswordChange from "../components/PasswordChange"
import { RootState } from "../store/store"

const mapDispatchToProps = (dispatch: Dispatch) => ({
  update: (oldPassword: string, password1: string, password2: string) =>
    dispatch(updatingPassword(password1, password2, oldPassword)),
  clearErrors: () => dispatch(setErrorPasswordUpdate({}))
})

const mapStateToProps = (state: RootState) => ({
  loading: state.passwordChange.loadingPasswordUpdate,
  error: state.passwordChange.errorPasswordUpdate
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PasswordChange)
