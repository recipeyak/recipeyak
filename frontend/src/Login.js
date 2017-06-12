import React from 'react'
import { Link } from 'react-router-dom'

const Login = () => (
  <div>
    <nav className="grid container">
      <h1 className="col-xs-2">
        <Link to="/" className="nav-item">Caena</Link>
      </h1>
    </nav>

    <main className="container form-container">
      <form>
        <fieldset>
          <legend>
            <Link to="/login">Login</Link>
          </legend>
          <label>Email
            <input className="input" type="email" name="email"/>
          </label>
          <label>Password
            <input className="input" type="password" name="email"/>
          </label>
        </fieldset>
        <p>Or <Link to="/signup">Signup</Link></p>
      </form>

    </main>

  </div>
)

export default Login
