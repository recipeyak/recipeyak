import React from 'react'
import { PropTypes } from 'prop-types'
import { Link } from 'react-router-dom'

import './home.scss'

const Home = ({ loggedIn = false }) => {
  const buttons = loggedIn
        ? (
          <div className="field is-grouped">
            <p className="control">
              <Link to="/recipes" className="button is-link">Recipes</Link>
            </p>
            <p className="control">
              <Link to="/logout" className="button">Logout</Link>
            </p>
          </div>
        )
       : (
          <div className="field is-grouped">
            <p className="control">
              <Link to="/login" className="button">Login</Link>
            </p>
            <p className="control">
              <Link to="/signup" className="button">Signup</Link>
            </p>
          </div>
       )
  return (
    <div className="main-container">

      <div className="hero">

        <nav className="container nav">

          <div className="nav-left">
            <div className="nav-item">
              <Link to="/" className="title">Caena</Link>
            </div>
          </div>

          <span>
            <span></span>
            <span></span>
            <span></span>
          </span>

          <div className="nav-right">

            <div className="nav-item">
              { buttons }
            </div>

          </div>

        </nav>

        <section className="container hero-container">
          <h2 className="title is-2 has-text-centered">A place to store, share, and create recipes</h2>
          <img className="hero-image" alt="interface in action" src="/list.png"></img>
        </section>

      </div>

    <div className="bottom">
      <div className="container">
        <section className="columns">

          <div className="column is-one-third content feature">
            <h3 className="title is-3">Quick Imports</h3>
            <ul>
              <li>
                Store your recipes for safe keeping
              </li>
              <li>
                Import from popular sevices like NYTimes Cooking, All Recipes, and more.
              </li>
            </ul>
          </div>

          <div className="column is-one-third content feature">
            <h3 className="title is-3">Infinite Versioning</h3>
            <ul>
              <li>
                Tweak your recipes with infinite version history.
              </li>
              <li>
                Review any of your changes in an instant.
              </li>
            </ul>
          </div>

          <div className="column is-one-third content feature">
            <h3 className="title is-3">Automate shopping</h3>
            <ul>
              <li>
                Auto-generate shopping lists for your meals.
              </li>
              <li>
                Share your shopping list with others and shop together!
              </li>
            </ul>
          </div>

        </section>
      </div>

      <footer className="has-text-centered">
        Caena ※ 2017
      </footer>

      </div>
    </div>
  )
}

Home.PropTypes = {
  loggedIn: PropTypes.bool,
}

export default Home
