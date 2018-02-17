import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import SocialButtons from './SocialButtons'
import { FormErrorHandler } from './Forms'

class Signup extends React.Component {
  state = {
    email: '',
    password1: '',
    password2: ''
  }

  componentWillMount = () => {
    this.props.clearErrors()
  }

  handleInputChange (e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSignup (e) {
    e.preventDefault()
    this.props.signup(this.state.email, this.state.password1, this.state.password2)
  }

  render () {
    const { loading } = this.props
    const { password1, password2, nonFieldErrors, email } = this.props.error

    return (
        <section className="section">
          <Helmet title='Sign Up'/>
          <div className="container">
            <div className="columns">
              <div className="column is-half-tablet is-offset-one-quarter-tablet is-one-third-desktop is-offset-one-third-desktop box">
                <div className="tabs is-boxed">
                  <ul>
                    <li>
                      <Link to="/login"><span>Login</span></Link>
                    </li>
                    <li className="is-active">
                      <Link to="/signup"><span>Sign Up</span></Link>
                    </li>
                  </ul>
                </div>

                <FormErrorHandler error={nonFieldErrors}/>

                <form onSubmit={ e => this.handleSignup(e) }>
                  <div className="field">
                    <label className="label">Email</label>
                    <p className="control">
                      <input
                        onChange={ e => this.handleInputChange(e) }
                        className={'my-input' + (email ? ' is-danger' : '')}
                        autoFocus
                        name="email"
                        type="email"
                        placeholder="rick.sanchez@me.com"/>
                    </p>
                    <FormErrorHandler error={email}/>
                  </div>

                  <div className="field">
                    <label htmlFor="password1" className="label">Password</label>
                    <p className="control">
                      <input
                        onChange={ e => this.handleInputChange(e) }
                        className={'my-input' + (password1 ? ' is-danger' : '')}
                        type="password"
                        name="password1"
                        id="password1"
                        placeholder="Super secret password."/>
                    </p>
                    <FormErrorHandler error={password1}/>
                  </div>

                  <div className="field">
                    <label htmlFor="password2" className="label">Password Again</label>
                    <p className="control">
                      <input
                        onChange={ e => this.handleInputChange(e) }
                        className={'my-input' + (password2 ? ' is-danger' : '')}
                        type="password"
                        name="password2"
                        id="password2"
                        placeholder="Enter your password again."/>
                    </p>
                    <FormErrorHandler error={password2}/>
                  </div>

                  <div className="field d-flex flex-space-between">
                    <p className="control">
                      <button
                        type="submit"
                        className={ 'my-button is-primary ' + (loading ? 'is-loading' : '')}>
                        Submit
                      </button>

                    </p>
                    <Link to="/password-reset" className="my-button is-link">Forgot Password?</Link>
                  </div>

                  </form>
                  <SocialButtons/>
              </div>
            </div>
          </div>
        </section>
    )
  }
}

export default Signup
