import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { FormErrorHandler } from './Forms'

class PasswordReset extends React.Component {
  state = {
    email: ''
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  async handleReset (e) {
    e.preventDefault()
    await this.props.reset(this.state.email)
    this.setState({ email: '' })
  }

  render () {
    const { nonFieldErrors, email } = this.props.error

    return (
        <section className="section">
          <Helmet title='Password Reset'/>
          <div className="container">
            <div className="columns">
              <div className="column is-half-tablet is-offset-one-quarter-tablet is-one-third-desktop is-offset-one-third-desktop box">
                <form onSubmit={ e => this.handleReset(e) }>
                  <h1 className="title is-5">Password Reset</h1>

                  <FormErrorHandler error={nonFieldErrors}/>

                  <div className="field">
                    <label className="label">Email</label>
                    <p className="control">
                      <input
                        autoFocus
                        onChange={ this.handleInputChange }
                        className={'my-input' + (email ? ' is-danger' : '')}
                        type="email"
                        name="email"
                        value={ this.state.email }
                        placeholder="rick.sanchez@me.com"/>
                    </p>
                    <FormErrorHandler error={email}/>
                  </div>

                  <div className="field d-flex flex-space-between">
                    <p className="control">
                      <button
                        className={ (this.props.loading ? 'is-loading ' : '') + 'my-button is-primary' }
                        type="submit">
                        Send Reset Email
                      </button>
                    </p>

                    <Link to="/login" className="my-button is-link">Login →</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
    )
  }
}

export default PasswordReset
