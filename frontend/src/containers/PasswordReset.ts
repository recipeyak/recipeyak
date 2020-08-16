import { connect } from "react-redux"

import { resetAsync, Dispatch } from "@/store/thunks"
import PasswordReset from "@/components/PasswordReset"
import { IState } from "@/store/store"

const mapDispatchToProps = (dispatch: Dispatch) => ({
  reset: resetAsync(dispatch),
})

const mapStateToProps = (state: IState) => ({
  loading: state.auth.loadingReset,
  error: state.auth.errorReset,
  loggedIn: state.user.loggedIn,
})

export default connect(mapStateToProps, mapDispatchToProps)(PasswordReset)
