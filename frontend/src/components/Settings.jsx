import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import Loader from './Loader'

import {
  GithubImg,
  GitlabImg,
} from './SocialButtons'

import {
  GITHUB_OAUTH_URL,
  GITLAB_OAUTH_URL,
} from '../settings'

const Settings = ({
  avatarURL,
  email,
  handleInputChange,
  updateEmail,
  updatingEmail,
  hasPassword,
  editing,
  socialAccountConnections,
  edit,
  cancelEdit,
  disconnectAccount,
  loadingGithub,
  loadingGitlab,
  errorGithub,
  errorGitlab,
  propsEmail
}) => {
  const unchanged = propsEmail === email

  const Github = () =>
  <div className="mb-2">
    <div className="d-flex justify-space-between">
      <div className="d-flex align-items-center">
        <GithubImg/>
        Github
      </div>
      <div className="d-flex align-center">
        { socialAccountConnections != null && socialAccountConnections.github != null
          ? <div className="d-flex align-center flex-wrap">
              <span className="has-text-success bold">Connected</span>
              <button onClick={ () => disconnectAccount('github', socialAccountConnections.github) } className={ loadingGithub ? 'is-loading my-button is-danger ml-2' : 'my-button is-danger ml-2' }>Disconnect</button>
            </div>
          : <a href={ GITHUB_OAUTH_URL + '/connect' } style={{'width': '120px'}} className="my-button ml-2">Connect</a>
        }
      </div>
    </div>
    { errorGithub && <p className="help is-danger"><b>Error: </b>{ errorGithub }</p> }
  </div>

  const Gitlab = () =>
  <div className="mb-2">
    <div className="d-flex justify-space-between">
      <div className="d-flex align-items-center">
        <GitlabImg/>
        Gitlab
      </div>
      <div className="d-flex align-center">
        { socialAccountConnections != null && socialAccountConnections.gitlab != null
          ? <div className="d-flex align-center flex-wrap">
              <span className="has-text-success bold">Connected</span>
              <button onClick={ () => disconnectAccount('gitlab', socialAccountConnections.gitlab) } className={ loadingGitlab ? 'is-loading my-button is-danger ml-2' : 'my-button is-danger ml-2' }>Disconnect</button>
            </div>
          : <a href={ GITLAB_OAUTH_URL + '/connect' } style={{'width': '120px'}} className="my-button ml-2">Connect</a>
        }
      </div>
    </div>
    { errorGitlab && <p className="help is-danger"><b>Error: </b>{ errorGitlab }</p> }
  </div>

  return <section className="d-grid justify-content-center">
    <Helmet title='Settings'/>

    <h1 className="fs-8">User settings</h1>

    <div className="d-flex">
    <a href="https://secure.gravatar.com" className="justify-self-center mr-3">
      <img className="br-100p" alt="user profile" src={ avatarURL + '&s=128'}/>
    </a>

    <div className="align-self-center d-flex flex-direction-column">
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
          : <a
            className={ 'ml-2' + (updatingEmail ? ' is-loading' : '') }
            name='email'
            onClick={ edit }
            value='edit'>
            Edit
          </a>
      }
    </form>

    <div className="d-flex justify-space-between">
      <label className="better-label">Password</label>
      { hasPassword
        ? <Link to="/password">Change Password</Link>
        : <Link to="/password/set">Set Password</Link>
      }

    </div>
  </div>
</div>

  <h1 className="fs-8">Social Accounts</h1>

  <Github/>
  <Gitlab/>

  </section>
}

class SettingsWithState extends React.Component {
  state = {
    email: this.props.email,
    loadingGithub: false,
    errorGithub: '',
    loadingGitlab: false,
    errorGitlab: false,
    errorGeneral: '',
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

  disconnectAccount = (provider, id) => {
    if (provider === 'github') {
      this.setState({ loadingGithub: true, errorGithub: '' })
    } else if (provider === 'gitlab') {
      this.setState({ loadingGitlab: true, errorGitlab: '' })
    }
    this.setState({ errorGeneral: '' })
    this.props.disconnectAccount(provider, id)
    .then(() => {
      this.setState({ loadingGithub: false, loadingGitlab: false })
    })
    .catch(error => {
      if (error.response && error.response.status === 403 && error.response.data && error.response.data.detail) {
        if (provider === 'github') {
          this.setState({ errorGithub: error.response.data.detail })
        } else if (provider === 'gitlab') {
          this.setState({ errorGitlab: error.response.data.detail })
        }
      } else {
        this.setState({ errorGeneral: 'Problem with action' })
      }
      this.setState({ loadingGithub: false, loadingGitlab: false })
    })
  }

  render () {
    const { email, editing, loadingGithub, loadingGitlab, errorGithub, errorGitlab } = this.state
    const { handleInputChange, disconnectAccount } = this

    const {
      updateEmail,
      avatarURL,
      updatingEmail,
      socialAccountConnections,
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

        hasPassword={ this.props.hasPassword }
        socialAccountConnections={ socialAccountConnections }
        disconnectAccount={ disconnectAccount }
        loadingGithub={ loadingGithub }
        loadingGitlab={ loadingGitlab }
        errorGithub={ errorGithub }
        errorGitlab={ errorGitlab }

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
