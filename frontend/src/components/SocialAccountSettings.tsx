import React, { useEffect, useState } from "react"
import { ButtonDanger } from "@/components/Buttons"

import { GithubImg, GitlabImg, GoogleImg } from "@/components/SocialButtons"

import {
  GITHUB_OAUTH_URL,
  GITLAB_OAUTH_URL,
  GOOGLE_OAUTH_URL,
} from "@/settings"
import { SocialProvider, ISocialAccountsState } from "@/store/reducers/user"

import { isOk, Result } from "@/result"
import { IState } from "@/store/store"
import { connect } from "react-redux"
import {
  Dispatch,
  fetchSocialConnectionsAsync,
  disconnectSocialAccountAsync,
} from "@/store/thunks"
import {
  WebData,
  isSuccessOrRefetching,
  Success,
  Loading,
  Failure,
  isFailure,
  isLoading,
} from "@/webdata"

function createRedirectURI(uri: string) {
  const url = new URL(uri)
  const REDIRECT_URI = "redirect_uri"
  const newRedirectURI = url.searchParams.get(REDIRECT_URI) + "/connect"
  url.searchParams.delete(REDIRECT_URI)
  url.searchParams.append(REDIRECT_URI, newRedirectURI || "")
  return url
}

function OAuthError({ children }: { children?: React.ReactNode }) {
  if (!children) {
    return null
  }
  return (
    <p className="help is-danger">
      <b>Error: </b>
      {children}
    </p>
  )
}

interface IOAuthButtonProps {
  readonly name: string
  readonly id: keyof ISocialAccountsState
  readonly Logo: () => JSX.Element
  readonly connection: number | null
  readonly disconnect: (
    providerName: SocialProvider,
  ) => Promise<Result<void, string>>
  readonly OAUTH_URL: string
}
const OAuthButton = ({
  name,
  id,
  Logo,
  OAUTH_URL,
  disconnect,
  connection,
}: IOAuthButtonProps) => {
  const [state, setState] = useState<WebData<void, string>>(undefined)
  const handleDisconnect = async () => {
    setState(Loading())
    const res = await disconnect(id)
    if (isOk(res)) {
      setState(Success(undefined))
    } else {
      setState(Failure(res.error))
    }
  }
  const url = createRedirectURI(OAUTH_URL)
  const connected = connection != null
  const error = isFailure(state) ? state.failure : null
  const loading = isLoading(state)

  return (
    <div className="mb-2">
      <div className="d-flex">
        <div className="d-flex align-items-center w-200px">
          <Logo />
          {name}
        </div>
        <div className="d-flex align-center">
          {connected ? (
            <ButtonDanger
              onClick={handleDisconnect}
              size="small"
              loading={loading}>
              Disconnect
            </ButtonDanger>
          ) : (
            <a href={url.href} className="my-button is-small">
              Connect
            </a>
          )}
        </div>
      </div>
      <OAuthError>{error}</OAuthError>
    </div>
  )
}

const mapDispatchToPropsOAuthButton = (dispatch: Dispatch) => ({
  disconnect: disconnectSocialAccountAsync(dispatch),
})

const ConnectedOAuthButton = connect(
  null,
  mapDispatchToPropsOAuthButton,
)(OAuthButton)

interface IProvider {
  readonly name: string
  readonly id: "github" | "gitlab" | "google"
  readonly logo: () => JSX.Element
  readonly oauthUrl: string
}
const providers: ReadonlyArray<IProvider> = [
  { name: "Github", id: "github", logo: GithubImg, oauthUrl: GITHUB_OAUTH_URL },
  { name: "Gitlab", id: "gitlab", logo: GitlabImg, oauthUrl: GITLAB_OAUTH_URL },
  { name: "Google", id: "google", logo: GoogleImg, oauthUrl: GOOGLE_OAUTH_URL },
]
interface IGenerateOAuthButtonsProps {
  readonly state: ISocialAccountsState
}
function OAuthButtons({ state }: IGenerateOAuthButtonsProps) {
  return (
    <>
      {providers.map(x => {
        return (
          <ConnectedOAuthButton
            key={x.id}
            name={x.name}
            id={x.id}
            Logo={x.logo}
            OAUTH_URL={x.oauthUrl}
            connection={state[x.id]}
          />
        )
      })}
    </>
  )
}

interface ISocialAccountsProps {
  readonly fetchData: () => void
  readonly connections: WebData<ISocialAccountsState, void>
}

function SocialAccounts({ fetchData, connections }: ISocialAccountsProps) {
  useEffect(fetchData, [])
  const data = !isSuccessOrRefetching(connections) ? (
    "Loading providers...."
  ) : (
    <OAuthButtons state={connections.data} />
  )
  return (
    <>
      <h1 className="fs-6">Social Accounts</h1>
      {data}
    </>
  )
}

const mapStateToProps = (state: IState) => ({
  connections: state.user.socialAccountConnections,
})
const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: () => {
    fetchSocialConnectionsAsync(dispatch)()
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(SocialAccounts)
