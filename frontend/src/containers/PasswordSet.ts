import { connect } from "react-redux"

import { updatingPassword, Dispatch } from "@/store/actions"

import PasswordChange from "@/components/PasswordChange"
import { RootState } from "@/store/store"
import { setErrorPasswordUpdate } from "@/store/reducers/passwordChange"

const mapDispatchToProps = (dispatch: Dispatch) => ({
  update: updatingPassword(dispatch),
  setPassword: true,
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
