import React from "react"
import { Helmet } from "@/components/Helmet"

import { FormErrorHandler, PasswordInput } from "@/components/Forms"
import { ButtonPrimary } from "@/components/Buttons"

interface IPasswordChangeError {
  readonly oldPassword?: string[]
  readonly newPassword?: string[]
  readonly newPasswordAgain?: string[]
}

interface IPasswordChangeProps {
  readonly clearErrors: () => void
  readonly update: (
    oldPassword: string,
    newPassword: string,
    newPasswordAgain: string
  ) => void
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
    newPasswordAgain: ""
  }

  static defaultProps = {
    setPassword: false
  }

  componentWillMount = () => {
    this.props.clearErrors()
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(({
      [e.target.name]: e.target.value
    } as unknown) as IPasswordChangestate)
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    this.props.update(
      this.state.oldPassword,
      this.state.newPassword,
      this.state.newPasswordAgain
    )
  }

  render() {
    const { loading, setPassword = false, error } = this.props

    const { password, newPassword, newPasswordAgain } = this.state

    const disabled =
      password === "" || newPassword === "" || newPasswordAgain === ""

    const pageTitle = !setPassword ? "Password Change" : "Password Set"

    return (
      <form
        onSubmit={this.handleSubmit}
        className="max-width-400px margin-0-auto">
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
          <ButtonPrimary
            disabled={disabled}
            type="submit"
            className="w-100"
            loading={loading}>
            Update
          </ButtonPrimary>
        </p>
      </form>
    )
  }
}

export default PasswordChange
