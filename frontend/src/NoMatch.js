import React from 'react'
import { Link } from 'react-router-dom'

class NoMatch extends React.Component {
  componentDidMount () {
    setTimeout(() => { this.props.history.push('/') }, 5000)
  }
  render () {
    return (
      <div>
        <nav className="grid container">
          <h1 className="col-xs-2">
            <Link to="/" className="nav-item">Caena</Link>
          </h1>
        </nav>

        <main className="grid container grid-center">
          <section className="col-md-12 col-xs-12">
            <h2>404 – File not found.</h2>
            <p>You will be automatically redirect <Link to="/">home</Link> in five seconds.</p>
          </section>
        </main>
      </div>
    )
  }
}

export default NoMatch
