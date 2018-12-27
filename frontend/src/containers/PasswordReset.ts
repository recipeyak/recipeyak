import { connect } from "react-redux"

import { reset, Dispatch } from "@/store/actions"
import PasswordReset from "@/components/PasswordReset"
import { RootState } from "@/store/store"

const mapDispatchToProps = (dispatch: Dispatch) => ({
  reset: reset(dispatch)
})

const mapStateToProps = (state: RootState) => ({
  loading: state.loading.reset,
  error: state.error.reset,
  loggedIn: state.user.loggedIn
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PasswordReset)
