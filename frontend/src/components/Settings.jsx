import React from 'react'
import { Link } from 'react-router-dom'

import './Settings.scss'

const Settings = ({
  avatarURL,
  email,
  handleInputChange,
  updateEmail,
  logout,
  updatingEmail
}) =>
  <section className="columns">

    <section className="column">

      <div className="d-flex">
        <a href="https://secure.gravatar.com" className="mr-3">
          <img alt="user profile" src={ avatarURL + '&s=128'}/>
        </a>
        <section className="d-flex direction-column justify-content-center">
          <div className="d-flex align-center">
            <label className="better-label">Email</label>
            <input
              value={ email }
              onChange={ handleInputChange }
              type='text'
              className='input'
              name='email' />
            <button
              className={ 'button ml-2' + (updatingEmail ? ' is-loading' : '') }
              name='email'
              onClick={ updateEmail }
              value='save email'>
              Save
            </button>
          </div>
          <div className="d-flex">
            <label className="better-label">Password</label>
            <Link to="/password">Change Password</Link>
          </div>
        </section>
      </div>

      <div className="d-flex align-center">
        <label className="better-label">Color Scheme</label>
        <div className="select">
          <select>
            <option>Light</option>
            <option>Sepia</option>
            <option>Dark</option>
          </select>
        </div>
      </div>

      <div className="control flex-align-center mt-4">
        <a className="mr-4">Export Recipes</a>

        <div className="select is-small">
          <select>
            <option>as TOML</option>
            <option>as JSON</option>
            <option>as YAML</option>
          </select>
        </div>
      </div>

      <a onClick={ logout }>Log out</a>

    </section>

  </section>

class SettingsWithState extends React.Component {
  state = {
    email: this.props.email
  }

  componentWillReceiveProps = nextProps => {
    this.setState({ email: nextProps.email })
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render () {
    const { email } = this.state
    const { handleInputChange } = this

    const {
      updateEmail,
      avatarURL,
      logout,
      updatingEmail
    } = this.props

    return (
      <Settings
        email={ email }
        handleInputChange={ handleInputChange }
        updateEmail={ () => updateEmail(email) }
        avatarURL={ avatarURL }
        updatingEmail={ updatingEmail }
        logout={ logout }
      />
    )
  }
}

export default SettingsWithState
