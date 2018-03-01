import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import SocialButtons from './SocialButtons'
import { FormErrorHandler } from './Forms'
import { ButtonPrimary } from './Buttons'

import AuthContainer from './AuthContainer'

const redirectURL = ({ pathname = '', search = '', hash = '' }) =>
  `${pathname}${search}${hash}`

class Login extends React.Component {
  state = {
    email: '',
    password: ''
  }

  componentWillMount = () => {
    this.props.clearErrors()
  }

  handleInputChange (e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleLogin (e) {
    e.preventDefault()
    const from = this.props.location.state != null
      ? this.props.location.state.from
      : {}
    this.props.login(this.state.email, this.state.password, redirectURL(from))
  }

  render () {
    const { loading } = this.props
    const { password1, nonFieldErrors, email } = this.props.error
    const { emailSocial, nonFieldErrorsSocial } = this.props.errorSocial

    return (
      <AuthContainer>
        <div className="box p-3">
          <Helmet title='Login'/>
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

          <form onSubmit={ e => this.handleLogin(e) }>
            <div className="field">
              <label className="label">Email</label>
                <input
                  onChange={ e => this.handleInputChange(e) }
                  value={ this.state.email }
                  className={'my-input' + (email ? ' is-danger' : '')}
                  autoFocus
                  name="email"
                  type="email"
                  placeholder="rick.sanchez@me.com"/>
              <FormErrorHandler error={email}/>
            </div>

            <div className="field">
              <label htmlFor="password" className="label">Password</label>
                <input
                  onChange={ e => this.handleInputChange(e) }
                  value={ this.state.query }
                  className={'my-input' + (password1 ? ' is-danger' : '')}
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Super secret password."/>
              <FormErrorHandler error={password1}/>
              <FormErrorHandler error={nonFieldErrors}/>
            </div>

            <div className="field d-flex flex-space-between align-items-center">
                <ButtonPrimary
                  type="submit"
                  loading={ loading }>
                  Submit
                </ButtonPrimary>
              <Link to="/password-reset">Forgot Password?</Link>
            </div>

            </form>
            <SocialButtons nonFieldErrors={nonFieldErrorsSocial} emailError={emailSocial} />
        </div>
      </AuthContainer>
    )
  }
}

export default Login
