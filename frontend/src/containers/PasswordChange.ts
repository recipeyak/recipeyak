import { connect } from "react-redux"

import PasswordChange from "@/components/PasswordChange"
import { clearPasswordUpdateError } from "@/store/reducers/passwordChange"
import { IState } from "@/store/store"
import { Dispatch, updatingPasswordAsync } from "@/store/thunks"

const mapDispatchToProps = (dispatch: Dispatch) => ({
  update: updatingPasswordAsync(dispatch),
  clearErrors: () => dispatch(clearPasswordUpdateError()),
})

const mapStateToProps = (state: IState) => ({
  loading: state.passwordChange.loadingPasswordUpdate,
  error: state.passwordChange.errorPasswordUpdate,
})

export default connect(mapStateToProps, mapDispatchToProps)(PasswordChange)
