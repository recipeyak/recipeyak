import React from "react"
import { connect } from "react-redux"
import { Link } from "react-router-dom"

import AuthContainer from "@/components/AuthContainer"
import { ButtonPrimary } from "@/components/Buttons"
import { EmailInput, FormErrorHandler, PasswordInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import type { ISignupErrors } from "@/store/reducers/auth"
import { setErrorSignup } from "@/store/reducers/auth"
import type { IState } from "@/store/store"
import type { Dispatch } from "@/store/thunks"
import { signupAsync } from "@/store/thunks"

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
    password2: "",
  }

  componentWillMount = () => {
    this.props.clearErrors()
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    /* eslint-disable @typescript-eslint/consistent-type-assertions */
    this.setState({
      [e.target.name]: e.target.value,
    } as unknown as ISignupState)
    /* eslint-enable @typescript-eslint/consistent-type-assertions */
  }

  handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    this.props.signup(
      this.state.email,
      this.state.password1,
      this.state.password2,
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
              <EmailInput
                onChange={this.handleInputChange}
                error={email != null}
                autoFocus
                name="email"
                placeholder="rick.sanchez@me.com"
              />
              <FormErrorHandler error={email} />
            </div>

            <div className="field">
              <label htmlFor="password1" className="label">
                Password
              </label>
              <PasswordInput
                onChange={this.handleInputChange}
                error={password1 != null}
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
              <PasswordInput
                onChange={this.handleInputChange}
                error={password2 != null}
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
        </div>
      </AuthContainer>
    )
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    signup: signupAsync(dispatch),
    clearErrors: () => dispatch(setErrorSignup({})),
  }
}

const mapStateToProps = (state: IState) => {
  return {
    loading: state.auth.loadingSignup,
    error: state.auth.errorSignup,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup)
