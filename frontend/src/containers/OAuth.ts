import { connect } from "react-redux"
import queryString from "query-string"

import { socialLoginAsync as login, Dispatch } from "@/store/thunks"
import OAuth from "@/components/OAuth"
import { IState } from "@/store/store"
import { RouteComponentProps } from "react-router"
import { SocialProvider } from "@/store/reducers/user"

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    login: login(dispatch)
  }
}

type RouteProps = RouteComponentProps<{
  service: SocialProvider
}>

const mapStateToProps = (state: IState, props: RouteProps) => {
  const service = props.match.params.service
  const parsed = queryString.parse(props.location.search)
  const token = parsed.token || parsed.code
  const redirectUrl = state.auth.fromUrl

  return {
    service,
    token: String(token),
    redirectUrl
  }
}

const mergeProps = (
  stateProps: ReturnType<typeof mapStateToProps>,
  dispatchProps: ReturnType<typeof mapDispatchToProps>
) => ({
  ...stateProps,
  login: () =>
    dispatchProps.login(
      stateProps.service,
      stateProps.token,
      stateProps.redirectUrl
    )
})

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(OAuth)
