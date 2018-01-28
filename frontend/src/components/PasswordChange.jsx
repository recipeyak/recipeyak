import React from 'react'
import { Helmet } from 'react-helmet'

class PasswordChange extends React.Component {
  state = {
    oldPassword: '',
    newPassword: '',
    newPasswordAgain: ''
  }

  componentWillMount = () => {
    this.props.clearErrors()
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.update(
      this.state.oldPassword,
      this.state.newPassword,
      this.state.newPasswordAgain
    )
  }

  render () {
    const {
      loading,
      setPassword = false,
      error
    } = this.props

    const {
      password,
      newPassword,
      newPasswordAgain
    } = this.state

    const disabled = password === '' || newPassword === '' || newPasswordAgain === ''

    const handleError = err =>
      err != null
        ? <p className="help is-danger">
            { err }
          </p>
        : null

    const pageTitle = !setPassword
      ? 'Password Change'
      : 'Password Set'

    return (
      <form onSubmit={ this.handleSubmit } className="max-width-400px margin-0-auto">

        <Helmet title={ pageTitle }/>

        <h2 className="title is-3">{ pageTitle }</h2>

        { !setPassword && <div className="field">
          <label className="label">Current Password</label>
          <div className="control">
            <input
              autoFocus
              onChange={ this.handleInputChange }
              className={ `my-input ${error.oldPassword != null ? 'is-danger' : ''}` }
              type="password"
              name="oldPassword"
              required/>
            { handleError(error.oldPassword) }
          </div>
        </div>
        }

        <div className="field">
          <label className="label">New Password</label>
          <div className="control">
            <input
              onChange={ this.handleInputChange }
              className="my-input"
              type="password"
              name="newPassword"
              required/>
            { handleError(error.newPassword) }
          </div>
        </div>

        <div className="field">
          <label className="label">New Password Again</label>
          <div className="control">
            <input
              onChange={ this.handleInputChange }
              className="my-input"
              type="password"
              name="newPasswordAgain"
              required/>
            { handleError(error.newPasswordAgain) }
          </div>
        </div>

        <p className="control">
          <button
            disabled={ disabled }
            type='submit'
            className={ `my-button w-100 is-primary ${loading ? 'is-loading' : ''}` }>
            Update
          </button>
        </p>
      </form>
    )
  }
}

export default PasswordChange
