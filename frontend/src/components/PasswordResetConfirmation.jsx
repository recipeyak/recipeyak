import React from 'react'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { FormErrorHandler } from './Forms'
import { ButtonPrimary } from './Buttons'

import { resetConfirmation as reset } from '../store/actions'

const mapStateToProps = (state, props) => {
  const uid = props.match.params.uid
  const token = props.match.params.token
  return {
    uid,
    token,
    loading: state.loading.resetConfirmation,
    error: state.error.resetConfirmation
  }
}

const mapDispatchToProps = dispatch => ({
  reset: (uid, token, newPassword1, newPassword2) => dispatch(reset(uid, token, newPassword1, newPassword2))
})

@connect(
  mapStateToProps,
  mapDispatchToProps
)
export default class PasswordResetConfirmation extends React.Component {
  state = {
    newPassword1: '',
    newPassword2: ''
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleReset = async e => {
    e.preventDefault()
    await this.props.reset(
      this.props.uid,
      this.props.token,
      this.state.newPassword1,
      this.state.newPassword2)
    this.setState({
      newPassword1: '',
      newPassword2: ''
    })
  }

  render () {
    const { nonFieldErrors, newPassword1, newPassword2 } = this.props.error

    return (
        <section className="section">
          <Helmet title='Password Reset'/>
          <div className="container">
            <div className="columns">
              <div className="column is-half-tablet is-offset-one-quarter-tablet is-one-third-desktop is-offset-one-third-desktop box">
                <form onSubmit={ this.handleReset }>
                  <h1 className="title is-5">Password Reset Confirmation</h1>

                  <FormErrorHandler error={nonFieldErrors}/>

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
                    <FormErrorHandler error={newPassword1}/>
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
                    <FormErrorHandler error={newPassword2}/>
                  </div>

                  <div className="field d-flex flex-space-between">
                    <p className="control">
                      <ButtonPrimary
                        loading={ this.props.loading }
                        type="submit">
                        Change Password
                      </ButtonPrimary>
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
