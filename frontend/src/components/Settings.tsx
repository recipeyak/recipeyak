import React from "react"
import { Helmet } from "@/components/Helmet"
import { Link } from "react-router-dom"

import Loader from "@/components/Loader"
import { ButtonPrimary, Button, ButtonDanger } from "@/components/Buttons"

import { GithubImg, GitlabImg } from "@/components/SocialButtons"

import { GITHUB_OAUTH_URL, GITLAB_OAUTH_URL } from "@/settings"
import { SocialProvider } from "@/store/reducers/user"
import { ISocialAccountsState } from "@/store/reducers/user"
import { AxiosError } from "axios"
import { TextInput } from "@/components/Forms"
import Sessions from "@/components/Sessions"

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

function Export() {
  return (
    <>
      <h1 className="fs-6">Export</h1>
      <p>
        <a href="/recipes.yaml">recipes.yaml</a>
      </p>
      <p>
        <a href="/recipes.json">recipes.json</a>
      </p>
    </>
  )
}

interface IDangerZoneProps {
  readonly deleteAccount: () => void
}

function DangerZone(props: IDangerZoneProps) {
  return (
    <>
      <h1 className="fs-6">Danger Zone</h1>
      <a onClick={props.deleteAccount} className="has-text-danger">
        permanently delete my account
      </a>
    </>
  )
}

interface IProfileImgProps {
  readonly avatarURL: string
}
function ProfileImg({ avatarURL }: IProfileImgProps) {
  return (
    <a href="https://secure.gravatar.com" className="justify-self-center mr-3">
      <img
        width="128px"
        height="128px"
        alt="user profile"
        className="br-5"
        src={avatarURL + "&s=128"}
      />
    </a>
  )
}

interface IEmailEditForm {
  readonly updateEmail: () => void
  readonly email: string
  readonly editing: boolean
  readonly updatingEmail: boolean
  readonly handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  readonly cancelEdit: () => void
  readonly edit: () => void
}

function EmailEditForm(props: IEmailEditForm) {
  return (
    <form
      className="d-flex align-center"
      onSubmit={e => {
        e.preventDefault()
        props.updateEmail()
      }}>
      <label className="better-label">Email</label>
      {props.editing ? (
        <TextInput
          onKeyDown={e => {
            if (e.key === "Escape") {
              props.cancelEdit()
            }
          }}
          autoFocus
          defaultValue={props.email}
          onChange={props.handleInputChange}
          name="email"
        />
      ) : (
        <span>{props.email}</span>
      )}
      {props.editing ? (
        <div className="d-flex">
          <ButtonPrimary
            className="ml-2"
            name="email"
            type="submit"
            loading={props.updatingEmail}
            value="save email">
            Save
          </ButtonPrimary>
          <Button
            className="ml-2"
            disabled={props.updatingEmail}
            name="email"
            onClick={props.cancelEdit}
            value="save email">
            Cancel
          </Button>
        </div>
      ) : (
        <a className="ml-2 has-text-primary" onClick={props.edit}>
          Edit
        </a>
      )}
    </form>
  )
}

interface IChangePasswordProps {
  readonly hasPassword: boolean
}

function ChangePassword({ hasPassword }: IChangePasswordProps) {
  return (
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
  )
}

interface ISocialAccountsProps {
  readonly errorGithub: string
  readonly loadingGithub: boolean
  readonly errorGitlab: string
  readonly loadingGitlab: boolean
  readonly socialAccountConnections: ISocialAccountsState
  readonly disconnect: (account: "github" | "gitlab", id: number) => void
}

function SocialAccounts(props: ISocialAccountsProps) {
  return (
    <>
      <h1 className="fs-6">Social Accounts</h1>

      <Github
        error={props.errorGithub}
        connected={props.socialAccountConnections.github != null}
        disconnect={() => {
          if (props.socialAccountConnections.github != null) {
            props.disconnect("github", props.socialAccountConnections.github)
          }
        }}
        loading={props.loadingGithub}
      />
      <Gitlab
        error={props.errorGitlab}
        connected={props.socialAccountConnections.gitlab != null}
        disconnect={() => {
          if (props.socialAccountConnections.gitlab != null) {
            props.disconnect("gitlab", props.socialAccountConnections.gitlab)
          }
        }}
        loading={props.loadingGitlab}
      />
    </>
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

  updateEmail = () => {
    this.props.updateEmail(this.state.email).then(() => {
      this.setState({ editing: false })
    })
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
      <>
        <Helmet title="Settings" />

        <h1 className="fs-8">User settings</h1>

        <div className="d-flex">
          <ProfileImg avatarURL={avatarURL} />

          <div className="align-self-center d-flex flex-direction-column">
            <EmailEditForm
              email={email}
              editing={editing}
              cancelEdit={this.cancelEdit}
              edit={this.edit}
              updatingEmail={updatingEmail}
              handleInputChange={handleInputChange}
              updateEmail={this.updateEmail}
            />
            <ChangePassword hasPassword={hasPassword} />
          </div>
        </div>

        <SocialAccounts
          errorGithub={errorGithub}
          errorGitlab={errorGitlab}
          loadingGithub={loadingGithub}
          loadingGitlab={loadingGitlab}
          socialAccountConnections={socialAccountConnections}
          disconnect={disconnectAccount}
        />

        <Export />
        <Sessions />
        <DangerZone deleteAccount={this.props.deleteUserAccount} />
      </>
    )
  }
}
