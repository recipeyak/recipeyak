import React from "react"
import { Link } from "react-router-dom"
import { Helmet } from "@/components/Helmet"

import SocialButtons from "@/components/SocialButtons"
import { FormErrorHandler, TextInput, PasswordInput } from "@/components/Forms"
import { ButtonPrimary } from "@/components/Buttons"

import AuthContainer from "@/components/AuthContainer"
import { Location } from "history"
import { ILoginError, ISocialError } from "@/store/reducers/auth"

const redirectURL = ({ pathname = "", search = "", hash = "" }) =>
  `${pathname}${search}${hash}`

interface ILoginProps {
  readonly setFromUrl: (url: string) => void
  readonly clearErrors: () => void
  readonly login: (email: string, password: string, fromUrl: string) => void
  readonly fromUrl: string
  readonly loading: boolean
  readonly error: ILoginError
  readonly errorSocial: ISocialError
  readonly location: Location<{ from: string } | undefined>
}

interface ILoginState {
  readonly email: string
  readonly password: string
}

class Login extends React.Component<ILoginProps, ILoginState> {
  state = {
    email: "",
    password: "",
  }

  componentWillMount = () => {
    this.props.clearErrors()
    const fromUrl =
      this.props.location.state != null ? this.props.location.state.from : {}
    this.props.setFromUrl(redirectURL(fromUrl))
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    /* eslint-disable @typescript-eslint/consistent-type-assertions */
    this.setState(({
      [e.target.name]: e.target.value,
    } as unknown) as ILoginState)
    /* eslint-enable @typescript-eslint/consistent-type-assertions */
  }

  handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    this.props.login(this.state.email, this.state.password, this.props.fromUrl)
  }

  render() {
    const { loading } = this.props
    const { password1, nonFieldErrors, email } = this.props.error
    const { emailSocial, nonFieldErrorsSocial } = this.props.errorSocial

    return (
      <AuthContainer>
        <div className="box p-3">
          <Helmet title="Login" />
          <div className="tabs is-boxed mb-2">
            <ul>
              <li className="is-active">
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/signup">Sign Up</Link>
              </li>
            </ul>
          </div>

          <form onSubmit={e => this.handleLogin(e)}>
            <div className="field">
              <label className="label">Email</label>
              <TextInput
                onChange={this.handleInputChange}
                value={this.state.email}
                error={email != null}
                autoFocus
                name="email"
                placeholder="rick.sanchez@me.com"
              />
              <FormErrorHandler error={email} />
            </div>

            <div className="field">
              <label htmlFor="password" className="label">
                Password
              </label>
              <PasswordInput
                onChange={this.handleInputChange}
                value={this.state.password}
                error={password1 != null}
                name="password"
                placeholder="Super secret password."
              />
              <FormErrorHandler error={password1} />
              <FormErrorHandler error={nonFieldErrors} />
            </div>

            <div className="field d-flex flex-space-between align-items-center">
              <ButtonPrimary type="submit" loading={loading}>
                Submit
              </ButtonPrimary>
              <Link to="/password-reset">Forgot Password?</Link>
            </div>
          </form>
          <SocialButtons
            nonFieldErrors={nonFieldErrorsSocial}
            emailError={emailSocial}
          />
        </div>
      </AuthContainer>
    )
  }
}

export default Login
