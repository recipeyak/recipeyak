import { connect } from "react-redux"
import queryString from "query-string"

import { socialConnect, Dispatch } from "store/actions"
import OAuth from "components/OAuth"
import { RootState } from "store/store"
import { SocialProvider } from "store/reducers/user"
import { RouteComponentProps } from "react-router"

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    login: socialConnect(dispatch)
  }
}
type RouteProps = RouteComponentProps<{ service: SocialProvider }>

const mapStateToProps = (_: RootState, props: RouteProps) => {
  const service = props.match.params.service
  const parsed = queryString.parse(props.location.search)
  const token = parsed.token || parsed.code

  return {
    service,
    token: String(token)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OAuth)
