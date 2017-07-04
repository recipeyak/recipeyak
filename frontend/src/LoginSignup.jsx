import React from 'react'
import { Link } from 'react-router-dom'

const Login = ({ location }) => {
  const passwordConfirm = location.pathname === '/signup' &&
    <div className="field">
      <label htmlFor="password2" className="label">Password Again</label>
      <p className="control">
        <input className="input" type="password" id="password2" placeholder="Enter your password again."/>
      </p>
    </div>

  return (
    <div className="container">
      <nav className="nav">
        <div className="nav-left">
          <div className="nav-item">
            <Link to="/" className="title">Caena</Link>
          </div>
        </div>
      </nav>

      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column is-one-third is-offset-one-third">
              <div className="tabs is-boxed">
                <ul>
                  <li className={ location.pathname === '/login' ? 'is-active' : '' }>
                    <Link to="/login"><span>Login</span></Link>
                  </li>
                  <li className={ location.pathname === '/signup' ? 'is-active' : '' }>
                    <Link to="/signup"><span>Sign Up</span></Link>
                  </li>
                </ul>
              </div>

              <div className="field">
                <label className="label">Email</label>
                <p className="control">
                  <input className="input" type="text" placeholder="rick.sanchez@me.com"/>
                </p>
              </div>

              <div className="field">
                <label htmlFor="password1" className="label">Password</label>
                <p className="control">
                  <input className="input" type="password" id="password1" placeholder="Super secret password."/>
                </p>
              </div>

              { passwordConfirm }

              <div className="field is-grouped">
                <p className="control">
                  <input type="submit" className="button is-primary" value="Submit"/>
                </p>
                <Link to="/password-reset" className="button is-link">Forgot Password?</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>)
}

export default Login
