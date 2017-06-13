import React from 'react'
import { Link } from 'react-router-dom'

const Signup = () => (
  <div>
    <nav className="grid container">
      <h1 className="col-xs-2">
        <Link to="/" className="nav-item">Caena</Link>
      </h1>
    </nav>

    <main className="container form-container">
      <form>
        <ul className="tabs">
          <li className="">
            <Link to="/login">Login</Link>
          </li>
          <li className="active">
            <Link to="/signup">Signup</Link>
          </li>
        </ul>

        <label>Email
          <div className="input-text">
            <input className="input" type="email" name="email" placeholder="name@example.com"/>
          </div>
        </label>
        <label>Password
          <div className="input-text">
            <input className="input" type="password" name="password-1" />
          </div>
        </label>
        <label>Password Again
          <div className="input-text">
            <input className="input" type="password" name="password-2" />
          </div>
        </label>
        <input type="submit" className="button" value="submit" name=""/>
      </form>
    </main>

  </div>
)

export default Signup
