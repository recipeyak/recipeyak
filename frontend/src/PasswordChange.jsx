import React from 'react'

class PasswordChange extends React.Component {
  constructor () {
    super()
    this.state = {
      password: '',
      newPassword: '',
      newPasswordAgain: '',
    }
  }

  handleInputChange (e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  render () {
    const { password, newPassword, newPasswordAgain } = this.state

    const fieldsNotEmpty = password !== '' && newPassword !== '' && newPasswordAgain !== ''
    const newPasswordFieldsSame = newPassword === newPasswordAgain
    const newPasswordFieldsAreNew = newPassword !== password

    const isValid = fieldsNotEmpty && newPasswordFieldsSame && newPasswordFieldsAreNew

    return (
      <section className="box">

        <h2 className="title is-3">Password Change</h2>

        <div className="field">
          <label className="label">Password</label>
          <div className="control">
            <input onChange={ (e) => this.handleInputChange(e) } className="input" type="password" name="password" required/>
          </div>
        </div>

        <div className="field">
          <label className="label">New Password</label>
          <div className="control">
            <input onChange={ (e) => this.handleInputChange(e) } className="input" type="password" name="newPassword" required/>
          </div>
        </div>

        <div className="field">
          <label className="label">New Password Again</label>
          <div className="control">
            <input onChange={ (e) => this.handleInputChange(e) } className="input" type="password" name="newPasswordAgain" required/>
          </div>
        </div>

        <p className="control">
          <button disabled={!isValid} className="button is-primary">
            Update
          </button>
        </p>
      </section>
    )
  }
}

export default PasswordChange
