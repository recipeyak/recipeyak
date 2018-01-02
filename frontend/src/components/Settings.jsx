import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import Loader from './Loader'

const Settings = ({
  avatarURL,
  email,
  handleInputChange,
  updateEmail,
  updatingEmail,
  editing,
  edit,
  cancelEdit,
  propsEmail
}) => {
  const unchanged = propsEmail === email
  return <section className="d-grid justify-content-center">
    <Helmet title='Settings'/>

    <a href="https://secure.gravatar.com" className="justify-self-center mr-3">
      <img alt="user profile" src={ avatarURL + '&s=128'}/>
    </a>

    <form
      className="d-flex align-center"
      onSubmit={
        e => {
          e.preventDefault()
          if (unchanged) return
          updateEmail()
        }
      }>
      <label className="better-label">Email</label>
      { editing
          ? <input
              onKeyDown={
                e => {
                  if (e.key === 'Escape') {
                    cancelEdit()
                  }
                }
              }
              autoFocus
              defaultValue={ propsEmail }
              onChange={ handleInputChange }
              type='text'
              className='my-input'
              name='email' />
          : <span>{ propsEmail }</span>
      }
      { editing
          ? <div className="d-flex">
            <button
              className={ 'my-button ml-2 is-primary' + (updatingEmail ? ' is-loading' : '') }
              disabled={ unchanged }
              name='email'
              type='submit'
              value='save email'>
              Save
            </button>
            <button
              className={ 'my-button ml-2' + (updatingEmail ? ' is-loading' : '') }
              name='email'
              onClick={ cancelEdit }
              value='save email'>
              Cancel
            </button>
          </div>
          : <button
            className={ 'my-button is-link ml-2' + (updatingEmail ? ' is-loading' : '') }
            name='email'
            onClick={ edit }
            value='edit'>
            Edit
          </button>
      }
    </form>

    <div className="d-flex">
      <label className="better-label">Password</label>
      <Link to="/password">Change Password</Link>
    </div>

    <a>Export Recipes</a>

  </section>
}

class SettingsWithState extends React.Component {
  state = {
    email: this.props.email,
    editing: false
  }

  componentWillReceiveProps = nextProps => {
    this.setState({ email: nextProps.email })
  }

  componentWillMount = () => {
    this.props.fetchData()
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render () {
    const { email, editing } = this.state
    const { handleInputChange } = this

    const {
      updateEmail,
      avatarURL,
      updatingEmail,
      loading
    } = this.props

    if (loading) {
      return <section className="d-flex justify-content-center">
        <Loader/>
      </section>
    }

    return (
      <Settings
        propsEmail={ this.props.email }
        email={ email }
        editing={ editing }
        edit={ () => this.setState({ editing: true }) }
        cancelEdit={ () => this.setState({ editing: false }) }
        handleInputChange={ handleInputChange }
        updateEmail={
          async () => {
            await updateEmail(email)
            this.setState({ editing: false })
          }
        }
        avatarURL={ avatarURL }
        updatingEmail={ updatingEmail }
      />
    )
  }
}

export default SettingsWithState
