import { connect } from "react-redux"

import { updatingPassword, Dispatch } from "@/store/thunks"

import PasswordChange from "@/components/PasswordChange"
import { IState } from "@/store/store"
import { clearPasswordUpdateError } from "@/store/reducers/passwordChange"

const mapDispatchToProps = (dispatch: Dispatch) => ({
  update: updatingPassword(dispatch),
  clearErrors: () => dispatch(clearPasswordUpdateError())
})

const mapStateToProps = (state: IState) => ({
  loading: state.passwordChange.loadingPasswordUpdate,
  error: state.passwordChange.errorPasswordUpdate
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PasswordChange)
