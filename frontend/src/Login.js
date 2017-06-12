import React from 'react'
import { Link } from 'react-router-dom'

const Login = () => (
  <div>
    <nav className="grid container">
      <h1 className="col-xs-2">
        <Link to="/" className="nav-item">Caena</Link>
      </h1>
    </nav>

    <main className="container">
      <form>
        <fieldset>
          <legend>
            <Link to="/">Login</Link>
          </legend>
          <label>Email
            <input type="email" name="email"/>
          </label>
          <label>Password
            <input type="password" name="email"/>
          </label>
        </fieldset>
      </form>
      <p>Or <Link to="/signup">Signup</Link></p>

    </main>

  </div>
)

export default Login
