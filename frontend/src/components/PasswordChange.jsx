import React from 'react'

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

  update = () => {
    console.log('update')
    this.props.update(this.state.password, this.state.newPassword, this.state.newPasswordAgain)
  }

  render () {
    const { loading } = this.props
    return (
      <section className="box">

        <h2 className="title is-3">Password Change</h2>

        <div className="field">
          <label className="label">Password</label>
          <div className="control">
            <input onChange={ this.handleInputChange } className="input" type="password" name="password" required/>
          </div>
        </div>

        <div className="field">
          <label className="label">New Password</label>
          <div className="control">
            <input onChange={ this.handleInputChange } className="input" type="password" name="newPassword" required/>
          </div>
        </div>

        <div className="field">
          <label className="label">New Password Again</label>
          <div className="control">
            <input onChange={ this.handleInputChange } className="input" type="password" name="newPasswordAgain" required/>
          </div>
        </div>

        <p className="control">
          <button onClick={ this.update } className={ `button is-primary ${loading ? 'is-loading' : ''}` }>
            Update
          </button>
        </p>
      </section>
    )
  }
}

export default PasswordChange
