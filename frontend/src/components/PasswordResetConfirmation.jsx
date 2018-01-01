import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

class PasswordResetConfirmation extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      newPassword1: '',
      newPassword2: ''
    }
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleReset = async e => {
    e.preventDefault()
    console.log(this.state)
    await this.props.reset(
      this.prop.uid,
      this.prop.token,
      this.state.newPassword1,
      this.state.newPassword2)
    this.setState({
      newPassword1: '',
      newPassword2: ''
    })
  }

  render () {
    const { nonFieldErrors, newPassword1, newPassword2 } = this.props.error

    const errorHandler = err =>
      !!err &&
      <div className="help is-danger">
        <ul>
          {err.map(e => (<li key={e}>{e}</li>))}
        </ul>
      </div>

    return (
        <section className="section">
          <Helmet title='Password Reset'/>
          <div className="container">
            <div className="columns">
              <div className="column is-half-tablet is-offset-one-quarter-tablet is-one-third-desktop is-offset-one-third-desktop box">
                <form onSubmit={ this.handleReset }>
                  <h1 className="title is-5">Password Reset Confirmation</h1>

                  { errorHandler(nonFieldErrors) }

                  <div className="field">
                    <label className="label">Password</label>
                    <p className="control">
                      <input
                        autoFocus
                        onChange={ this.handleInputChange }
                        className={'my-input' + (newPassword1 ? ' is-danger' : '')}
                        type="password"
                        name="newPassword1"
                        value={ this.state.newPassword1 }/>
                    </p>
                    { errorHandler(newPassword1) }
                  </div>

                  <div className="field">
                    <label className="label">Password Again</label>
                    <p className="control">
                      <input
                        onChange={ this.handleInputChange }
                        className={'my-input' + (newPassword2 ? ' is-danger' : '')}
                        type="password"
                        name="newPassword2"
                        value={ this.state.newPassword2 }/>
                    </p>
                    { errorHandler(newPassword2) }
                  </div>

                  <div className="field d-flex flex-space-between">
                    <p className="control">
                      <button
                        className={ (this.props.loading ? 'is-loading ' : '') + 'my-button is-primary' }
                        type="submit">
                        Change Password
                      </button>
                    </p>

                    <Link to="/login" className="my-button is-link">To Login</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
    )
  }
}

export default PasswordResetConfirmation
