import React from "react"
import { Helmet } from "./Helmet"
import { Link } from "react-router-dom"

import Loader from "./Loader"
import { ButtonPrimary, Button, ButtonDanger } from "./Buttons"

import { GithubImg, GitlabImg } from "./SocialButtons"

import { GITHUB_OAUTH_URL, GITLAB_OAUTH_URL } from "settings"
import { SocialProvider } from "store/reducers/user"
import { ISocialAccountsState } from "store/reducers/user"
import { AxiosError } from "axios"

interface IOAuthButtonProps {
  readonly name: string
  readonly Logo: () => JSX.Element
  readonly error: unknown
  readonly connected: boolean
  readonly disconnect: () => void
  readonly disconnecting: boolean
  readonly OAUTH_URL: string
}

const OAuthButton = ({
  name,
  Logo,
  error,
  connected,
  OAUTH_URL,
  disconnect,
  disconnecting
}: IOAuthButtonProps) => (
  <div className="mb-2">
    <div className="d-flex">
      <div className="d-flex align-items-center w-200px">
        <Logo />
        {name}
      </div>
      <div className="d-flex align-center">
        {connected ? (
          <div className="d-flex align-center flex-wrap">
            <span className="has-text-success bold">Connected</span>
            <ButtonDanger
              onClick={disconnect}
              loading={disconnecting}
              className="ml-2">
              Disconnect
            </ButtonDanger>
          </div>
        ) : (
          <a href={OAUTH_URL + "/connect"} className="my-button">
            Connect
          </a>
        )}
      </div>
    </div>
    {error && (
      <p className="help is-danger">
        <b>Error: </b>
        {error}
      </p>
    )}
  </div>
)

interface ISettingsWithStateProps {
  readonly fetchData: () => void
  readonly disconnectAccount: (
    provider: SocialProvider,
    id: number
  ) => Promise<void>
  readonly deleteUserAccount: () => void
  readonly email: string
  readonly updateEmail: (email: string) => Promise<void>
  readonly avatarURL: string
  readonly updatingEmail: boolean
  readonly socialAccountConnections: ISocialAccountsState
  readonly loading: boolean
  readonly hasPassword: boolean
}

interface ISettingsWithStateState {
  readonly email: string
  readonly loadingGithub: boolean
  readonly errorGithub: string
  readonly loadingGitlab: boolean
  readonly errorGitlab: string
  readonly errorGeneral: string
  readonly editing: boolean
}

interface ISocialButtonProps {
  readonly error: string
  readonly connected: boolean
  readonly disconnect: () => void
  readonly loading: boolean
}

function Gitlab(props: ISocialButtonProps) {
  return (
    <OAuthButton
      name="Gitlab"
      Logo={GitlabImg}
      error={props.error}
      connected={props.connected}
      OAUTH_URL={GITLAB_OAUTH_URL}
      disconnect={props.disconnect}
      disconnecting={props.loading}
    />
  )
}

function Github(props: ISocialButtonProps) {
  return (
    <OAuthButton
      name="Github"
      Logo={GithubImg}
      error={props.error}
      connected={props.connected}
      OAUTH_URL={GITHUB_OAUTH_URL}
      disconnect={props.disconnect}
      disconnecting={props.loading}
    />
  )
}

export default class SettingsWithState extends React.Component<
  ISettingsWithStateProps,
  ISettingsWithStateState
> {
  state: ISettingsWithStateState = {
    email: this.props.email,
    loadingGithub: false,
    errorGithub: "",
    loadingGitlab: false,
    errorGitlab: "",
    errorGeneral: "",
    editing: false
  }

  componentWillReceiveProps = (nextProps: ISettingsWithStateProps) => {
    this.setState({ email: nextProps.email })
  }

  componentWillMount = () => {
    this.props.fetchData()
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(({
      [e.target.name]: e.target.value
    } as unknown) as ISettingsWithStateState)
  }

  disconnectAccount = (provider: SocialProvider, id: number) => {
    if (provider === "github") {
      this.setState({ loadingGithub: true, errorGithub: "" })
    } else if (provider === "gitlab") {
      this.setState({ loadingGitlab: true, errorGitlab: "" })
    }
    this.setState({ errorGeneral: "" })
    // TODO(chdsbd): Fix this ugly mess with Redux
    this.props
      .disconnectAccount(provider, id)
      .then(() => {
        this.setState({ loadingGithub: false, loadingGitlab: false })
      })
      .catch((error: AxiosError) => {
        if (
          error.response &&
          error.response.status === 403 &&
          error.response.data &&
          // tslint:disable-next-line:no-unsafe-any
          error.response.data.detail
        ) {
          if (provider === "github") {
            // tslint:disable-next-line:no-unsafe-any
            this.setState({ errorGithub: error.response.data.detail })
          } else if (provider === "gitlab") {
            // tslint:disable-next-line:no-unsafe-any
            this.setState({ errorGitlab: error.response.data.detail })
          }
        } else {
          this.setState({ errorGeneral: "Problem with action" })
        }
        this.setState({ loadingGithub: false, loadingGitlab: false })
      })
  }

  cancelEdit = () => this.setState({ editing: false })

  edit = () => this.setState({ editing: true })

  deleteAccountPrompt = () => {
    const response = prompt(
      "Are you sure you want to permanently delete your account? \nPlease type, 'delete my account', to irrevocably delete your account"
    )
    if (response != null && response.toLowerCase() === "delete my account") {
      this.props.deleteUserAccount()
    }
  }

  render() {
    const {
      email,
      editing,
      loadingGithub,
      loadingGitlab,
      errorGithub,
      errorGitlab
    } = this.state
    const { handleInputChange, disconnectAccount } = this

    const {
      updateEmail,
      avatarURL,
      updatingEmail,
      socialAccountConnections,
      loading,
      hasPassword
    } = this.props

    if (loading) {
      return (
        <section className="d-flex justify-content-center">
          <Loader />
        </section>
      )
    }

    return (
      <section>
        <Helmet title="Settings" />

        <h1 className="fs-8">User settings</h1>

        <div className="d-flex">
          <a
            href="https://secure.gravatar.com"
            className="justify-self-center mr-3">
            <img
              width="128px"
              height="128px"
              alt="user profile"
              src={avatarURL + "&s=128"}
            />
          </a>

          <div className="align-self-center d-flex flex-direction-column">
            <form
              className="d-flex align-center"
              onSubmit={e => {
                e.preventDefault()
                updateEmail(this.state.email).then(() => {
                  this.setState({ editing: false })
                })
              }}>
              <label className="better-label">Email</label>
              {editing ? (
                <input
                  onKeyDown={e => {
                    if (e.key === "Escape") {
                      this.cancelEdit()
                    }
                  }}
                  autoFocus
                  defaultValue={email}
                  onChange={handleInputChange}
                  type="text"
                  className="my-input"
                  name="email"
                />
              ) : (
                <span>{email}</span>
              )}
              {editing ? (
                <div className="d-flex">
                  <ButtonPrimary
                    className="ml-2"
                    name="email"
                    type="submit"
                    loading={updatingEmail}
                    value="save email">
                    Save
                  </ButtonPrimary>
                  <Button
                    className="ml-2"
                    loading={updatingEmail}
                    name="email"
                    onClick={this.cancelEdit}
                    value="save email">
                    Cancel
                  </Button>
                </div>
              ) : (
                <a
                  className={
                    "ml-2 has-text-primary" +
                    (updatingEmail ? " is-loading" : "")
                  }
                  onClick={this.edit}>
                  Edit
                </a>
              )}
            </form>

            <div className="d-flex justify-space-between">
              <label className="better-label">Password</label>
              {hasPassword ? (
                <Link to="/password" className="has-text-primary">
                  Change Password
                </Link>
              ) : (
                <Link to="/password/set" className="has-text-primary">
                  Set Password
                </Link>
              )}
            </div>
          </div>
        </div>

        <h1 className="fs-6">Social Accounts</h1>

        <Github
          error={errorGithub}
          connected={socialAccountConnections.github != null}
          disconnect={() => {
            if (socialAccountConnections.github != null) {
              disconnectAccount("github", socialAccountConnections.github)
            }
          }}
          loading={loadingGithub}
        />
        <Gitlab
          error={errorGitlab}
          connected={socialAccountConnections.gitlab != null}
          disconnect={() => {
            if (socialAccountConnections.gitlab != null) {
              disconnectAccount("gitlab", socialAccountConnections.gitlab)
            }
          }}
          loading={loadingGitlab}
        />

        <h1 className="fs-6">Danger Zone</h1>
        <a onClick={this.deleteAccountPrompt} className="has-text-danger">
          permanently delete my account
        </a>

        <h1 className="fs-6">Export</h1>
        <p>
          <a href="/recipes.yaml">recipes.yaml</a>
        </p>
        <p>
          <a href="/recipes.json">recipes.json</a>
        </p>
      </section>
    )
  }
}
