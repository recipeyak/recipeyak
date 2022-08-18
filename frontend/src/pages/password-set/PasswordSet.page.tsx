import { connect } from "react-redux"

import PasswordChange from "@/pages/password-change/PasswordChange.page"
import { clearPasswordUpdateError } from "@/store/reducers/passwordChange"
import type { IState } from "@/store/store"
import type { Dispatch } from "@/store/thunks"
import { updatingPasswordAsync } from "@/store/thunks"

const mapDispatchToProps = (dispatch: Dispatch) => ({
  update: updatingPasswordAsync(dispatch),
  setPassword: true,
  clearErrors: () => dispatch(clearPasswordUpdateError()),
})

const mapStateToProps = (state: IState) => ({
  loading: state.passwordChange.loadingPasswordUpdate,
  error: state.passwordChange.errorPasswordUpdate,
})

export default connect(mapStateToProps, mapDispatchToProps)(PasswordChange)
