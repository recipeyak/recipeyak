import React, { useEffect, useState } from "react"
import { ButtonDanger } from "@/components/Buttons"

import { GithubImg, GitlabImg, GoogleImg } from "@/components/SocialButtons"

import {
  GITHUB_OAUTH_URL,
  GITLAB_OAUTH_URL,
  GOOGLE_OAUTH_URL
} from "@/settings"
import { SocialProvider } from "@/store/reducers/user"
import { ISocialAccountsState } from "@/store/reducers/user"
import { isOk, Result } from "@/result"
import { IState } from "@/store/store"
import { connect } from "react-redux"
import {
  Dispatch,
  fetchSocialConnections,
  disconnectSocialAccount
} from "@/store/thunks"
import {
  WebData,
  isSuccessOrRefetching,
  Success,
  Loading,
  Failure,
  isFailure,
  isLoading
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
    providerName: SocialProvider
  ) => Promise<Result<void, string>>
  readonly OAUTH_URL: string
}
const OAuthButton = ({
  name,
  id,
  Logo,
  OAUTH_URL,
  disconnect,
  connection
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
  disconnect: disconnectSocialAccount(dispatch)
})

const ConnectedOAuthButton = connect(
  null,
  mapDispatchToPropsOAuthButton
)(OAuthButton)

interface ISocialButtonProps {
  readonly connection: number | null
}

function Gitlab({ connection }: ISocialButtonProps) {
  return (
    <ConnectedOAuthButton
      name="Gitlab"
      id="gitlab"
      Logo={GitlabImg}
      OAUTH_URL={GITLAB_OAUTH_URL}
      connection={connection}
    />
  )
}

function Github({ connection }: ISocialButtonProps) {
  return (
    <ConnectedOAuthButton
      name="Github"
      id="github"
      Logo={GithubImg}
      OAUTH_URL={GITHUB_OAUTH_URL}
      connection={connection}
    />
  )
}
function Google({ connection }: ISocialButtonProps) {
  return (
    <ConnectedOAuthButton
      name="Google"
      id="google"
      Logo={GoogleImg}
      OAUTH_URL={GOOGLE_OAUTH_URL}
      connection={connection}
    />
  )
}

interface ISocialAccountsProps {
  readonly fetchData: () => void
  readonly connections: WebData<ISocialAccountsState, void>
}

function SocialAccounts({ fetchData, connections }: ISocialAccountsProps) {
  useEffect(fetchData, [])
  if (!isSuccessOrRefetching(connections)) {
    return null
  }
  return (
    <>
      <h1 className="fs-6">Social Accounts</h1>
      <Github connection={connections.data.github} />
      <Gitlab connection={connections.data.gitlab} />
      <Google connection={connections.data.google} />
    </>
  )
}

const mapStateToProps = (state: IState) => ({
  connections: state.user.socialAccountConnections
})
const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: () => {
    fetchSocialConnections(dispatch)()
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SocialAccounts)
