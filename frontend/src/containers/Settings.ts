import { connect } from "react-redux"

import {
  fetchUser,
  fetchSocialConnections,
  updatingEmail,
  disconnectSocialAccount,
  loggingOut,
  deleteUserAccount,
  Dispatch
} from "@/store/actions"

import Settings from "@/components/Settings"
import { RootState } from "@/store/store"

const mapStateToProps = (state: RootState) => {
  return {
    avatarURL: state.user.avatarURL,
    email: state.user.email,
    updatingEmail: state.user.updatingEmail,
    hasPassword: state.user.hasUsablePassword,
    socialAccountConnections: state.user.socialAccountConnections,
    loading: state.user.loading
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    logout: loggingOut(dispatch),
    fetchData: () => {
      fetchUser(dispatch)()
      fetchSocialConnections(dispatch)()
    },
    disconnectAccount: disconnectSocialAccount(dispatch),
    deleteUserAccount: deleteUserAccount(dispatch),
    updateEmail: updatingEmail(dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings)
