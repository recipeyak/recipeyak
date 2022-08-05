import React from "react"
import { Link } from "react-router-dom"

import AuthContainer from "@/components/AuthContainer"
import { ButtonPrimary } from "@/components/Buttons"
import { EmailInput, FormErrorHandler } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { IPasswordResetError } from "@/store/reducers/auth"

interface IPasswordResetProps {
  readonly reset: (email: string) => Promise<void>
  readonly loggedIn: boolean
  readonly loading: boolean
  readonly error: IPasswordResetError
}

interface IPasswordResetState {
  readonly email: string
}

class PasswordReset extends React.Component<
  IPasswordResetProps,
  IPasswordResetState
> {
  state: IPasswordResetState = {
    email: "",
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    /* eslint-disable @typescript-eslint/consistent-type-assertions */
    this.setState({
      [e.target.name]: e.target.value,
    } as unknown as IPasswordResetState)
    /* eslint-enable @typescript-eslint/consistent-type-assertions */
  }

  async handleReset(e: React.FormEvent) {
    e.preventDefault()
    await this.props.reset(this.state.email)
    this.setState({ email: "" })
  }

  render() {
    const { nonFieldErrors, email } = this.props.error

    const redirect = this.props.loggedIn
      ? { name: "Home", route: "/" }
      : { name: "Login", route: "/login" }

    return (
      <AuthContainer>
        <Helmet title="Password Reset" />
        <form className="box p-3" onSubmit={(e) => this.handleReset(e)}>
          <h1 className="title is-5 mb-2 fw-500">Password Reset</h1>

          <FormErrorHandler error={nonFieldErrors} />

          <div className="field">
            <label className="label">Email</label>
            <EmailInput
              autoFocus
              onChange={this.handleInputChange}
              error={email != null}
              name="email"
              value={this.state.email}
              required
              placeholder="a.person@me.com"
            />
            <FormErrorHandler error={email} />
          </div>

          <div className="field d-flex flex-space-between align-items-center">
            <ButtonPrimary loading={this.props.loading} type="submit">
              Send Reset Email
            </ButtonPrimary>

            <Link to={redirect.route}>{redirect.name} →</Link>
          </div>
        </form>
      </AuthContainer>
    )
  }
}

export default PasswordReset
