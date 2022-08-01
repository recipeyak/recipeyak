import { connect } from "react-redux"

import {
  updatingEmailAsync,
  deleteUserAccountAsync,
  Dispatch,
  fetchingUserAsync,
} from "@/store/thunks"

import Settings from "@/components/Settings"
import { IState } from "@/store/store"

const ACCOUNT_DELETION_PROMPT =
  "Are you sure you want to permanently delete your account? \nPlease type, 'delete my account', to irrevocably delete your account"
const DELETION_RESPONSE = "delete my account"

const mapStateToProps = (state: IState) => ({
  avatarURL: state.user.avatarURL,
  email: state.user.email,
  name: state.user.name,
  updatingEmail: state.user.updatingEmail,
  hasPassword: state.user.hasUsablePassword,
  loading: state.user.loading,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: () => {
    fetchingUserAsync(dispatch)()
  },
  deleteUserAccount: () => {
    const response = prompt(ACCOUNT_DELETION_PROMPT)
    if (response != null && response.toLowerCase() === DELETION_RESPONSE) {
      deleteUserAccountAsync(dispatch)()
    }
  },
  updateEmail: updatingEmailAsync(dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
