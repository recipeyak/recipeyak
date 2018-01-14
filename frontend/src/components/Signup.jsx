import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import githubIcon from './github-logo.svg'
import gitlabIcon from './gitlab-logo.svg'
import googleIcon from './google-logo.svg'
import bitbucketIcon from './bitbucket-logo.svg'
import facebookIcon from './facebook-logo.svg'

class Signup extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      email: '',
      password1: '',
      password2: ''
    }
  }

  componentWillMount = () => {
    this.props.clearErrors()
  }

  handleInputChange (e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSignup (e) {
    e.preventDefault()
    this.props.signup(this.state.email, this.state.password1, this.state.password2)
  }

  render () {
    const { loading } = this.props
    const { password1, password2, nonFieldErrors, email } = this.props.error

    const errorHandler = err =>
      !!err &&
      <p className="help is-danger">
        <ul>
          {err.map(e => (<li>{e}</li>))}
        </ul>
      </p>

    return (
        <section className="section">
          <Helmet title='Sign Up'/>
          <div className="container">
            <div className="columns">
              <div className="column is-half-tablet is-offset-one-quarter-tablet is-one-third-desktop is-offset-one-third-desktop box">
                <div className="tabs is-boxed">
                  <ul>
                    <li>
                      <Link to="/login"><span>Login</span></Link>
                    </li>
                    <li className="is-active">
                      <Link to="/signup"><span>Sign Up</span></Link>
                    </li>
                  </ul>
                </div>

                { errorHandler(nonFieldErrors) }

                <form onSubmit={ e => this.handleSignup(e) }>
                  <div className="field">
                    <label className="label">Email</label>
                    <p className="control">
                      <input
                        onChange={ e => this.handleInputChange(e) }
                        className={'my-input' + (email ? ' is-danger' : '')}
                        autoFocus
                        name="email"
                        type="email"
                        placeholder="rick.sanchez@me.com"/>
                    </p>
                  { errorHandler(email) }
                  </div>

                  <div className="field">
                    <label htmlFor="password1" className="label">Password</label>
                    <p className="control">
                      <input
                        onChange={ e => this.handleInputChange(e) }
                        className={'my-input' + (password1 ? ' is-danger' : '')}
                        type="password"
                        name="password1"
                        id="password1"
                        placeholder="Super secret password."/>
                    </p>
                  { errorHandler(password1) }
                  </div>

                  <div className="field">
                    <label htmlFor="password2" className="label">Password Again</label>
                    <p className="control">
                      <input
                        onChange={ e => this.handleInputChange(e) }
                        className={'my-input' + (password2 ? ' is-danger' : '')}
                        type="password"
                        name="password2"
                        id="password2"
                        placeholder="Enter your password again."/>
                    </p>
                  { errorHandler(password2) }
                  </div>

                  <div className="field d-flex flex-space-between">
                    <p className="control">
                      <button
                        type="submit"
                        className={ 'my-button is-primary ' + (loading ? 'is-loading' : '')}>
                        Submit
                      </button>

                    </p>
                    <Link to="/password-reset" className="my-button is-link">Forgot Password?</Link>
                  </div>

                  </form>
                  <div className="d-flex align-items-center mb-2 mt-1"><span className="or-bar"></span> or <span className="or-bar"></span></div>
                  <div className="social-buttons">
                    <a href="https://github.com/login/oauth/authorize?response_type=code&client_id=049f5adf78aec24969f2&scope=user:email" className="my-button is-github"><img className="mr-2" src={githubIcon} alt="github icon"/>Github</a>
                    <button className="my-button" disabled>
                      <img className="mr-2" src={gitlabIcon} alt="gitlab icon"/>
                      Gitlab
                    </button>
                    <button className="my-button" disabled>
                      <img className="mr-2" src={bitbucketIcon} alt="bitbucket icon"/>
                      Bitbucket
                    </button>
                    <button className="my-button" disabled>
                      <img className="mr-2" src={googleIcon} alt="google icon"/>
                      Google
                    </button>
                    <button className="my-button" disabled>
                      <img className="mr-2" src={facebookIcon} alt="facebook icon"/>
                      Facebook</button>
                  </div>
              </div>
            </div>
          </div>
        </section>
    )
  }
}

export default Signup
