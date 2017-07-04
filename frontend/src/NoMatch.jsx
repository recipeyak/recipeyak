import React from 'react'
import { Link } from 'react-router-dom'

const NoMatch = () => (
  <div>
    <nav className="grid container">
      <h1 className="col-xs-2">
        <Link to="/" className="nav-item">Caena</Link>
      </h1>
    </nav>

    <main className="grid container grid-center">
      <section className="col-md-12 col-xs-12">
        <h2>404 – File not found.</h2>
        <p>Head <Link to="/">home</Link></p>
      </section>
    </main>
  </div>
)

export default NoMatch
