import * as React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import Logo from './Logo'

class AuthContainer extends React.Component {

  componentDidMount = () => {
    document.querySelector('html').classList.add('bg-primary')
  }

  componentWillUnmount= () => {
    document.querySelector('html').classList.remove('bg-primary')
  }
  render () {
    return (
      <section className="section">
        <Helmet title='Auth'/>
        <div className="container">
          <div className="columns">
            <div className="column is-half-tablet is-offset-one-quarter-tablet is-one-third-desktop is-offset-one-third-desktop">
              <Link to="/" className="pl-0 pr-0 fs-2rem fw-normal font-family-title d-flex align-center justify-content-center pb-3 text-decoration-none has-text-white">
                <Logo light={true}/>
                <span className="fw-500">Recipe Yak</span>
              </Link>
              { this.props.children }
            </div>
          </div>
        </div>
      </section>
    )
  }

}

export default AuthContainer
