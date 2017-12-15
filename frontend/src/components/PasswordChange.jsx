import React from 'react'
import { Helmet } from 'react-helmet'

class PasswordChange extends React.Component {
  constructor () {
    super()
    this.state = {
      password: '',
      newPassword: '',
      newPasswordAgain: ''
    }
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.update(this.state.password, this.state.newPassword, this.state.newPasswordAgain)
  }

  render () {
    const { loading } = this.props

    const { password, newPassword, newPasswordAgain } = this.state
    const disabled = password === '' || newPassword === '' || newPasswordAgain === ''
    return (
      <form onSubmit={ this.handleSubmit } className="max-width-400px margin-0-auto">
        <Helmet title='Password Change'/>

        <h2 className="title is-3">Password Change</h2>

        <div className="field">
          <label className="label">Password</label>
          <div className="control">
            <input
              autoFocus
              onChange={ this.handleInputChange }
              className="my-input"
              type="password"
              name="password"
              required/>
          </div>
        </div>

        <div className="field">
          <label className="label">New Password</label>
          <div className="control">
            <input
              onChange={ this.handleInputChange }
              className="my-input"
              type="password"
              name="newPassword"
              required/>
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
          </div>
        </div>

        <p className="control">
          <button
            disabled={ disabled }
            type='submit'
            className={ `my-button is-primary ${loading ? 'is-loading' : ''}` }>
            Update
          </button>
        </p>
      </form>
    )
  }
}

export default PasswordChange
