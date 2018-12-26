import React from "react"
import { Helmet } from "@/components/Helmet"
import { Link } from "react-router-dom"

import SocialButtons from "@/components/SocialButtons"
import { FormErrorHandler } from "@/components/Forms"
import { ButtonPrimary } from "@/components/Buttons"
import AuthContainer from "@/components/AuthContainer"
import { ISignupErrors } from "@/store/reducers/error"

interface ISignupProps {
  readonly clearErrors: () => void
  readonly signup: (email: string, password1: string, password2: string) => void
  readonly error: ISignupErrors
  readonly loading: boolean
}

interface ISignupState {
  readonly email: string
  readonly password1: string
  readonly password2: string
}

class Signup extends React.Component<ISignupProps, ISignupState> {
  state = {
    email: "",
    password1: "",
    password2: ""
  }

  componentWillMount = () => {
    this.props.clearErrors()
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(({
      [e.target.name]: e.target.value
    } as unknown) as ISignupState)
  }

  handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    this.props.signup(
      this.state.email,
      this.state.password1,
      this.state.password2
    )
  }

  render() {
    const { loading } = this.props
    const { password1, password2, nonFieldErrors, email } = this.props.error

    return (
      <AuthContainer>
        <div className="box p-3">
          <Helmet title="Sign Up" />
          <div className="tabs is-boxed mb-2">
            <ul>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li className="is-active">
                <Link to="/signup">Sign Up</Link>
              </li>
            </ul>
          </div>

          <FormErrorHandler error={nonFieldErrors} />

          <form onSubmit={this.handleSignup}>
            <div className="field">
              <label className="label">Email</label>
              <input
                onChange={this.handleInputChange}
                className={"my-input" + (email ? " is-danger" : "")}
                autoFocus
                name="email"
                type="email"
                placeholder="rick.sanchez@me.com"
              />
              <FormErrorHandler error={email} />
            </div>

            <div className="field">
              <label htmlFor="password1" className="label">
                Password
              </label>
              <input
                onChange={this.handleInputChange}
                className={"my-input" + (password1 ? " is-danger" : "")}
                type="password"
                name="password1"
                id="password1"
                placeholder="Super secret password."
              />
              <FormErrorHandler error={password1} />
            </div>

            <div className="field">
              <label htmlFor="password2" className="label">
                Password Again
              </label>
              <input
                onChange={this.handleInputChange}
                className={"my-input" + (password2 ? " is-danger" : "")}
                type="password"
                name="password2"
                id="password2"
                placeholder="Enter your password again."
              />
              <FormErrorHandler error={password2} />
            </div>

            <div className="field d-flex flex-space-between align-items-center">
              <ButtonPrimary type="submit" loading={loading}>
                Submit
              </ButtonPrimary>

              <Link to="/password-reset">Forgot Password?</Link>
            </div>
          </form>
          <SocialButtons />
        </div>
      </AuthContainer>
    )
  }
}

export default Signup
