import React from 'react'
import { Link } from 'react-router-dom'

const PasswordReset = () => (
  <div className="container">
    <nav className="nav">
      <div className="nav-left">
        <div className="nav-item">
          <Link to="/" className="title">Caena</Link>
        </div>
      </div>
      <div className="nav-right">
        <Link to="/login" className="nav-item">Login</Link>
        <Link to="/signup" className="nav-item">Signup</Link>
      </div>
    </nav>

    <section className="section">
      <div className="container">
        <div className="columns">
          <div className="column is-one-third is-offset-one-third">
            <h1 className="title is-4">Password Reset</h1>
            <div className="field">
              <label className="label">Email</label>
              <p className="control">
                <input className="input" type="text" placeholder="rick.sanchez@me.com"/>
              </p>
            </div>

            <div className="field is-grouped">
              <p className="control">
                <input type="submit" className="button is-primary" value="Send Reset Email"/>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
)

export default PasswordReset
