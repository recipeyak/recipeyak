import React from "react"
import { Helmet } from "@/components/Helmet"
import { Link } from "react-router-dom"
import Loader from "@/components/Loader"
import { ButtonPrimary, Button } from "@/components/Buttons"
import { TextInput } from "@/components/Forms"
import Sessions from "@/components/Sessions"

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
      onSubmit={(e) => {
        e.preventDefault()
        props.updateEmail()
      }}
    >
      <label className="better-label">Email</label>
      {props.editing ? (
        <TextInput
          onKeyDown={(e) => {
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
          <Button
            className="ml-2"
            disabled={props.updatingEmail}
            name="email"
            onClick={props.cancelEdit}
            value="save email"
          >
            Cancel
          </Button>
          <ButtonPrimary
            className="ml-2"
            name="email"
            type="submit"
            loading={props.updatingEmail}
            value="save email"
          >
            Save
          </ButtonPrimary>
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

export interface ISettingsProps {
  readonly fetchData: () => void
  readonly deleteUserAccount: () => void
  readonly email: string
  readonly updateEmail: (email: string) => Promise<void>
  readonly avatarURL: string
  readonly updatingEmail: boolean
  readonly loading: boolean
  readonly hasPassword: boolean
}
interface ISettingsState {
  readonly email: string
  readonly editing: boolean
}
export default class Settings extends React.Component<
  ISettingsProps,
  ISettingsState
> {
  state: ISettingsState = {
    email: this.props.email,
    editing: false,
  }

  componentWillReceiveProps = (nextProps: ISettingsProps) => {
    this.setState({ email: nextProps.email })
  }

  componentWillMount = () => {
    this.props.fetchData()
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    /* eslint-disable @typescript-eslint/consistent-type-assertions */
    this.setState({
      [e.target.name]: e.target.value,
    } as unknown as ISettingsState)
    /* eslint-enable @typescript-eslint/consistent-type-assertions */
  }

  cancelEdit = () => this.setState({ editing: false })

  edit = () => this.setState({ editing: true })

  updateEmail = () => {
    void this.props.updateEmail(this.state.email).then(() => {
      this.setState({ editing: false })
    })
  }

  render() {
    const { email, editing } = this.state
    const { handleInputChange } = this

    const { avatarURL, updatingEmail, loading, hasPassword } = this.props

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

        <Export />
        <Sessions />
        <DangerZone deleteAccount={this.props.deleteUserAccount} />
      </>
    )
  }
}
