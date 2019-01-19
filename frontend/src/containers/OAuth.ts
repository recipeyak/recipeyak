import { connect } from "react-redux"
import queryString from "query-string"

import { socialLogin as login, Dispatch } from "@/store/thunks"
import OAuth from "@/components/OAuth"
import { RootState } from "@/store/store"
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

const mapStateToProps = (state: RootState, props: RouteProps) => {
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OAuth)
