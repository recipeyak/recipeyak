import * as React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { AxiosError, AxiosResponse } from 'axios'

import Loader from './Loader'
import { ButtonPrimary, ButtonPlain } from './Buttons'

import {
  GithubImg,
  GitlabImg,
} from './SocialButtons'

import {
  GITHUB_OAUTH_URL,
  GITLAB_OAUTH_URL,
} from '../settings'


interface ISettingsProps {
  disconnectAccount(provider: string, id: number): Promise<AxiosResponse>
  updateEmail(email: string): Promise<AxiosResponse>
  avatarURL: boolean
  updatingEmail: boolean
  socialAccountConnections: {
    [key:string]: number
  }
  loading: boolean
  email: string
  fetchData(): void
  hasPassword: boolean
}

interface ISettingsState {
  email: string
  loadingGithub: boolean
  errorGithub: string
  loadingGitlab: boolean
  errorGitlab: string
  errorGeneral: string
  editing: boolean
}

class SettingsWithState extends React.Component<ISettingsProps, ISettingsState> {
  state = {
    email: this.props.email,
    loadingGithub: false,
    errorGithub: '',
    loadingGitlab: false,
    errorGitlab: '',
    errorGeneral: '',
    editing: false
  }

  componentWillReceiveProps (nextProps: ISettingsProps) {
    this.setState({ email: nextProps.email })
  }

  componentWillMount () {
    this.props.fetchData()
  }

  handleInputChange = (e: any) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  disconnectAccount = (provider: string, id: number) => {
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
    .catch((error: AxiosError) => {
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
    if (this.props.loading) {
      return <section className="d-flex justify-content-center">
        <Loader/>
      </section>
    }
    const edit = () => this.setState({
      editing: true
    })

    const cancelEdit = () => this.setState({
      editing: false
    })

    const updateEmail = async() => {
      await this.props.updateEmail(this.state.email)
      this.setState({
        editing: false
      })
    }

    const updatingEmail = this.props.updatingEmail

    const unchanged = this.props.email === this.state.email
    const Github = () =>
      <div className="mb-2">
        <div className="d-flex justify-space-between">
          <div className="d-flex align-items-center">
            <GithubImg/>
            Github
          </div>
          <div className="d-flex align-center">
            { this.props.socialAccountConnections != null && this.props.socialAccountConnections.github != null
              ? <div className="d-flex align-center flex-wrap">
                  <span className="has-text-success bold">Connected</span>
                  <button onClick={ () => this.disconnectAccount('github', this.props.socialAccountConnections.github) } className={ this.state.loadingGithub ? 'is-loading my-button is-danger ml-2' : 'my-button is-danger ml-2' }>Disconnect</button>
                </div>
              : <a href={ GITHUB_OAUTH_URL + '/connect' } style={{ 'width': '120px' }} className="my-button ml-2">Connect</a>
            }
          </div>
        </div>
        { this.state.errorGithub && <p className="help is-danger"><b>Error: </b>{ this.state.errorGithub }</p> }
      </div>

    const Gitlab = () =>
      <div className="mb-2">
        <div className="d-flex justify-space-between">
          <div className="d-flex align-items-center">
            <GitlabImg/>
            Gitlab
          </div>
          <div className="d-flex align-center">
            { this.props.socialAccountConnections != null && this.props.socialAccountConnections.gitlab != null
              ? <div className="d-flex align-center flex-wrap">
                  <span className="has-text-success bold">Connected</span>
                  <button onClick={ () => this.disconnectAccount('gitlab', this.props.socialAccountConnections.gitlab) } className={ this.state.loadingGitlab ? 'is-loading my-button is-danger ml-2' : 'my-button is-danger ml-2' }>Disconnect</button>
                </div>
              : <a href={ GITLAB_OAUTH_URL + '/connect' } style={{ 'width': '120px' }} className="my-button ml-2">Connect</a>
            }
          </div>
        </div>
        { this.state.errorGitlab && <p className="help is-danger"><b>Error: </b>{ this.state.errorGitlab }</p> }
      </div>

      return (
        <section className="d-grid justify-content-center">
          <Helmet title='Settings'/>

          <h1 className="fs-8">User settings</h1>

          <div className="d-flex">
          <a href="https://secure.gravatar.com" className="justify-self-center mr-3">
            <img className="br-100p" alt="user profile" src={ this.props.avatarURL + '&s=128'}/>
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
              { this.state.editing
                  ? <input
                      onKeyDown={
                        e => {
                          if (e.key === 'Escape') {
                            cancelEdit()
                          }
                        }
                      }
                      autoFocus
                      defaultValue={ this.props.email }
                      onChange={ this.handleInputChange }
                      type='text'
                      className='my-input'
                      name='email' />
                  : <span>{ this.props.email }</span>
              }
              { this.state.editing
                  ? <div className="d-flex">
                    <ButtonPrimary
                      className='ml-2'
                      name="email"
                      type="submit"
                      loading={ updatingEmail }
                      disabled={ unchanged }
                      value='save email'>
                      Save
                    </ButtonPrimary>
                    <ButtonPlain
                      className='ml-2'
                      loading={ updatingEmail }
                      name='email'
                      onClick={ cancelEdit }
                      value='save email'>
                      Cancel
                    </ButtonPlain>
                  </div>
                  : <a className={ 'ml-2 has-text-primary' + (updatingEmail ? ' is-loading' : '') }
                       onClick={ edit }>
                    Edit
                  </a>
              }
            </form>

            <div className="d-flex justify-space-between">
              <label className="better-label">Password</label>
              { this.props.hasPassword
                ? <Link to="/password" className="has-text-primary">Change Password</Link>
                : <Link to="/password/set" className="has-text-primary">Set Password</Link>
              }

            </div>
          </div>
        </div>

        <h1 className="fs-6">Social Accounts</h1>

        <Github/>
        <Gitlab/>

      </section>
    )
  }
}

export default SettingsWithState
