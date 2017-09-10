import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

class Login extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      email: '',
      password: '',
    }
  }

  handleInputChange (e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleLogin (e) {
    e.preventDefault()
    this.props.login(this.state.email, this.state.password)
  }

  render () {
    const { loading } = this.props
    const { password1, nonFieldErrors, email } = this.props.error

    const validLogin =
      this.state.email !== '' &&
      this.state.password !== ''

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
              <Link to="/" className="title">Caena</Link>
            </div>
          </div>
        </nav>

        <section className="section">
          <div className="container">
            <div className="columns">
              <div className="column is-one-third is-offset-one-third box">
                <div className="tabs is-boxed">
                  <ul>
                    <li className="is-active">
                      <Link to="/login"><span>Login</span></Link>
                    </li>
                    <li>
                      <Link to="/signup"><span>Sign Up</span></Link>
                    </li>
                  </ul>
                </div>

                { nonFieldErrors && errorHandler(nonFieldErrors) }

                <form onSubmit={ e => this.handleLogin(e) }>
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
                    <label htmlFor="password" className="label">Password</label>
                    <p className="control">
                      <input
                        onChange={ e => this.handleInputChange(e) }
                        className={'input' + (password1 ? ' is-danger' : '')}
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Super secret password."/>
                    </p>
                    { password1 && errorHandler(password1) }
                  </div>

                  <div className="field flex-space-between">
                    <p className="control">
                      <button
                        type="submit"
                        disabled={ !validLogin }
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

Login.PropTypes = {
  loading: PropTypes.bool.isRequired,
  login: PropTypes.func.isRequired,
}

export default Login
