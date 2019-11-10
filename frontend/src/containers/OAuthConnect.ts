import { connect } from "react-redux"
import queryString from "query-string"

import { socialConnectAsync, Dispatch } from "@/store/thunks"
import OAuth from "@/components/OAuth"
import { IState } from "@/store/store"
import { SocialProvider } from "@/store/reducers/user"
import { RouteComponentProps } from "react-router"

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    login: socialConnectAsync(dispatch)
  }
}
type RouteProps = RouteComponentProps<{ service: SocialProvider }>

const mapStateToProps = (_: IState, props: RouteProps) => {
  const service = props.match.params.service
  const parsed = queryString.parse(props.location.search)
  const token = parsed.token || parsed.code

  return {
    service,
    token: String(token)
  }
}

const mergeProps = (
  stateProps: ReturnType<typeof mapStateToProps>,
  dispatchProps: ReturnType<typeof mapDispatchToProps>
) => ({
  ...stateProps,
  login: () => dispatchProps.login(stateProps.service, stateProps.token)
})

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(OAuth)
