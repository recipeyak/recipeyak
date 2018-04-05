import { connect, Dispatch } from 'react-redux'

import { StateTree } from '../store/store'

import {
  fetchUser,
  fetchSocialConnections,
  updatingEmail,
  disconnectSocialAccount,
  loggingOut
} from '../store/actions'

import Settings from '../components/Settings'

const mapStateToProps = (state: StateTree) => {
  return {
    avatarURL: state.user.avatarURL,
    email: state.user.email,
    updatingEmail: state.user.updatingEmail,
    hasPassword: state.user.hasUsablePassword,
    socialAccountConnections: state.user.socialAccountConnections,
    loading: state.user.loading
  }
}

const mapDispatchToProps = (dispatch: Dispatch<StateTree>) => {
  return {
    logout: () => {
      dispatch(loggingOut())
    },
    fetchData: () => {
      dispatch(fetchUser())
      dispatch(fetchSocialConnections())
    },
    disconnectAccount: (provider: string, id: number) => dispatch(disconnectSocialAccount(provider, id)),
    updateEmail: (email: string) => dispatch(updatingEmail(email))
  }
}

const ConnectedSettings = connect<{},{},{}>(
  mapStateToProps,
  mapDispatchToProps
)(Settings)

export default ConnectedSettings
