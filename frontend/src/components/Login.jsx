import React from 'react'
import { Link } from 'react-router-dom'

class Login extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      email: '',
      password: ''
    }
  }

  componentWillMount = () => {
    this.props.clearErrors()
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

    const errorHandler = err =>
      !!err &&
      <p className="help is-danger">
        <ul>
          {err.map(e => (<li>{e}</li>))}
        </ul>
      </p>

    return (
        <section className="section">
          <div className="container">
            <div className="columns">
              <div className="column is-half-tablet is-offset-one-quarter-tablet is-one-third-desktop is-offset-one-third-desktop box">
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

                <form onSubmit={ e => this.handleLogin(e) }>
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
                    <label htmlFor="password" className="label">Password</label>
                    <p className="control">
                      <input
                        onChange={ e => this.handleInputChange(e) }
                        className={'my-input' + (password1 ? ' is-danger' : '')}
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Super secret password."/>
                    </p>
                    { errorHandler(password1) }
                    { errorHandler(nonFieldErrors) }
                  </div>

                  <div className="field d-flex flex-space-between">
                    <p className="control">
                      <button
                        type="submit"
                        className={ 'my-button is-primary ' + (loading ? 'is-loading' : '')}>
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
    )
  }
}

export default Login
