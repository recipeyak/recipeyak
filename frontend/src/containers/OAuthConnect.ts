import { connect, Dispatch } from 'react-redux'
import {
    Location,
} from 'history'

import queryString from 'query-string'

import { StateTree } from '../store/store'

import { socialConnect as login } from '../store/actions'
import OAuth from '../components/OAuth'


interface OAuthProps {
  match: {
    params: {
      service: string
    }
  },
  location: Location
}

const mapDispatchToProps = (dispatch: Dispatch<StateTree>) => {
  return {
    login: (service: string, token: string) => dispatch(login(service, token))
  }
}

const mapStateToProps = (_: StateTree, props: OAuthProps) => {
  const service = props.match.params.service
  const parsed = queryString.parse(props.location.search)
  const token = parsed.token || parsed.code

  return {
    service,
    token
  }
}

const ConnectedPasswordReset = connect<{},{},{}>(
  mapStateToProps,
  mapDispatchToProps
)(OAuth)

export default ConnectedPasswordReset
