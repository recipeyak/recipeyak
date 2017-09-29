import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

class Signup extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      email: '',
      password1: '',
      password2: '',
    }
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

    const validSignup =
      this.state.email !== '' &&
      this.state.password1 !== '' &&
      this.state.password2 !== ''

    const errorHandler = err =>
      <p className="help is-danger">
        <ul>
          {err.map(e => (<li>{e}</li>))}
        </ul>
      </p>

    return (
      <div className="container">
        <nav className="nav">
          <div className="nav-left">
            <div className="nav-item">
              <Link to="/" className="title">Recipe Yak</Link>
            </div>
          </div>
        </nav>

        <section className="section">
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

                { nonFieldErrors && errorHandler(nonFieldErrors) }

                <form onSubmit={ e => this.handleSignup(e) }>
                  <div className="field">
                    <label className="label">Email</label>
                    <p className="control">
                      <input
                        onChange={ e => this.handleInputChange(e) }
                        className={'input' + (email ? ' is-danger' : '')}
                        autoFocus
                        name="email"
                        type="email"
                        placeholder="rick.sanchez@me.com"/>
                    </p>
                  { email && errorHandler(email) }
                  </div>

                  <div className="field">
                    <label htmlFor="password1" className="label">Password</label>
                    <p className="control">
                      <input
                        onChange={ e => this.handleInputChange(e) }
                        className={'input' + (password1 ? ' is-danger' : '')}
                        type="password"
                        name="password1"
                        id="password1"
                        placeholder="Super secret password."/>
                    </p>
                  { password1 && errorHandler(password1) }
                  </div>

                  <div className="field">
                    <label htmlFor="password2" className="label">Password Again</label>
                    <p className="control">
                      <input
                        onChange={ e => this.handleInputChange(e) }
                        className={'input' + (password2 ? ' is-danger' : '')}
                        type="password"
                        name="password2"
                        id="password2"
                        placeholder="Enter your password again."/>
                    </p>
                  { password2 && errorHandler(password2) }
                  </div>

                  <div className="field flex-space-between">
                    <p className="control">
                      <button
                        type="submit"
                        disabled={ !validSignup }
                        className={ 'button is-primary ' + (loading ? 'is-loading' : '')}>
                        Submit
                      </button>

                    </p>
                    <Link to="/password-reset" className="button is-link">Forgot Password?</Link>
                  </div>

                  </form>
              </div>
            </div>
          </div>
        </section>
      </div>)
  }
}

Signup.PropTypes = {
  loading: PropTypes.bool.isRequired,
  signup: PropTypes.func.isRequired,
}

export default Signup
