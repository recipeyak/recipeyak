import { connect } from "react-redux"

import { reset, Dispatch } from "@/store/thunks"
import PasswordReset from "@/components/PasswordReset"
import { IState } from "@/store/store"

const mapDispatchToProps = (dispatch: Dispatch) => ({
  reset: reset(dispatch)
})

const mapStateToProps = (state: IState) => ({
  loading: state.auth.loadingReset,
  error: state.auth.errorReset,
  loggedIn: state.user.loggedIn
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PasswordReset)
