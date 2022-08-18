import React from "react"
import { connect } from "react-redux"

import { ButtonPrimary } from "@/components/Buttons"
import { FormErrorHandler, PasswordInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { clearPasswordUpdateError } from "@/store/reducers/passwordChange"
import type { IState } from "@/store/store"
import type { Dispatch } from "@/store/thunks"
import { updatingPasswordAsync } from "@/store/thunks"

interface IPasswordChangeError {
  readonly oldPassword?: string[]
  readonly newPassword?: string[]
  readonly newPasswordAgain?: string[]
}

interface IUpdate {
  password1: string
  password2: string
  oldPassword: string
}
interface IPasswordChangeProps {
  readonly clearErrors: () => void
  readonly update: ({ password1, password2, oldPassword }: IUpdate) => void
  readonly error: IPasswordChangeError
  readonly setPassword?: boolean
  readonly loading: boolean
}

interface IPasswordChangestate {
  readonly oldPassword: string
  readonly newPassword: string
  readonly newPasswordAgain: string
  readonly password: string
}

class PasswordChange extends React.Component<
  IPasswordChangeProps,
  IPasswordChangestate
> {
  state: IPasswordChangestate = {
    password: "",
    oldPassword: "",
    newPassword: "",
    newPasswordAgain: "",
  }

  static defaultProps = {
    setPassword: false,
  }

  componentWillMount = () => {
    this.props.clearErrors()
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    /* eslint-disable @typescript-eslint/consistent-type-assertions */
    this.setState({
      [e.target.name]: e.target.value,
    } as unknown as IPasswordChangestate)
    /* eslint-enable @typescript-eslint/consistent-type-assertions */
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const { oldPassword, newPassword, newPasswordAgain } = this.state
    this.props.update({
      password1: newPassword,
      password2: newPasswordAgain,
      oldPassword,
    })
  }

  render() {
    const { loading, setPassword = false, error } = this.props

    const pageTitle = !setPassword ? "Password Change" : "Password Set"

    return (
      <form
        onSubmit={this.handleSubmit}
        className="max-width-400px margin-0-auto"
      >
        <Helmet title={pageTitle} />

        <h2 className="title is-3">{pageTitle}</h2>

        {!setPassword && (
          <div className="field">
            <label className="label">Current Password</label>
            <div className="control">
              <PasswordInput
                autoFocus
                onChange={this.handleInputChange}
                error={error.oldPassword != null}
                name="oldPassword"
                required
              />
              <FormErrorHandler error={error.oldPassword} />
            </div>
          </div>
        )}

        <div className="field">
          <label className="label">New Password</label>
          <div className="control">
            <PasswordInput
              onChange={this.handleInputChange}
              name="newPassword"
              required
            />
            <FormErrorHandler error={error.newPassword} />
          </div>
        </div>

        <div className="field">
          <label className="label">New Password Again</label>
          <div className="control">
            <PasswordInput
              onChange={this.handleInputChange}
              name="newPasswordAgain"
              required
            />
            <FormErrorHandler error={error.newPasswordAgain} />
          </div>
        </div>

        <p className="control">
          <ButtonPrimary type="submit" className="w-100" loading={loading}>
            Update
          </ButtonPrimary>
        </p>
      </form>
    )
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  update: updatingPasswordAsync(dispatch),
  clearErrors: () => dispatch(clearPasswordUpdateError()),
})

const mapStateToProps = (state: IState) => ({
  loading: state.passwordChange.loadingPasswordUpdate,
  error: state.passwordChange.errorPasswordUpdate,
})

export default connect(mapStateToProps, mapDispatchToProps)(PasswordChange)
