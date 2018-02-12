import { connect } from 'react-redux'
import queryString from 'query-string'

import { socialConnect as login } from '../store/actions.js'
import OAuth from '../components/OAuth.jsx'

const mapDispatchToProps = dispatch => {
  return {
    login: (service, token) => dispatch(login(service, token))
  }
}

const mapStateToProps = (_, props) => {
  const service = props.match.params.service
  const parsed = queryString.parse(props.location.search)
  const token = parsed.token || parsed.code

  return {
    service,
    token
  }
}

const ConnectedPasswordReset = connect(
  mapStateToProps,
  mapDispatchToProps
)(OAuth)

export default ConnectedPasswordReset
