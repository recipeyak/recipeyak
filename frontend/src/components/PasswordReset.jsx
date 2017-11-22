import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

class PasswordReset extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      email: ''
    }
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleReset = async e => {
    e.preventDefault()
    await this.props.reset(this.state.email)
    this.setState({ email: '' })
  }

  render () {
    const { nonFieldErrors, email } = this.props.error

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
                <form onSubmit={ this.handleReset }>
                  <h1 className="title is-5">Password Reset</h1>

                  { nonFieldErrors && errorHandler(nonFieldErrors) }

                  <div className="field">
                    <label className="label">Email</label>
                    <p className="control">
                      <input
                        autoFocus
                        onChange={ this.handleInputChange }
                        className={'input' + (email ? ' is-danger' : '')}
                        type="email"
                        name="email"
                        value={ this.state.email }
                        placeholder="rick.sanchez@me.com"/>
                    </p>
                    { email && errorHandler(email) }
                  </div>

                  <div className="field flex-space-between">
                    <p className="control">
                      <button
                        className={ (this.props.loading ? 'is-loading ' : '') + 'button is-primary' }
                        type="submit">
                        Send Reset Email
                      </button>
                    </p>

                    <Link to="/login" className="button is-link">To Login</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }
}

PasswordReset.PropTypes = {
  reset: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.bool.isRequired
}

export default PasswordReset
