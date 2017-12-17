import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

const Settings = ({
  avatarURL,
  email,
  handleInputChange,
  updateEmail,
  logout,
  updatingEmail
}) =>
    <section className="d-flex direction-column">
      <Helmet title='Settings'/>

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
              className='my-input'
              name='email' />
            <button
              className={ 'my-button ml-2' + (updatingEmail ? ' is-loading' : '') }
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
        <label className="better-label d-flex align-items-center">
        <input type='checkbox' className="mr-2"/>
          Dark Mode
        </label>
      </div>

      <a>Export Recipes</a>

      <a onClick={ logout }>Log out</a>

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
