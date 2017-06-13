import React from 'react'
import { Link } from 'react-router-dom'

const NoMatch = () => (
  <div>
    <nav className="grid container">
      <h1 className="col-xs-2">
        <Link to="/" className="nav-item">Caena</Link>
      </h1>
    </nav>

    <main className="grid container">
      <section className="grid-center">
        <h2>404</h2>
        <p>Page not found.</p>
        <p>Go <Link to="/">Home</Link></p>
      </section>
    </main>

  </div>
)

export default NoMatch
