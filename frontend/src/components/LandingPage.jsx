import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

const LandingPage = () =>
  <section className="home-grid">
    <Helmet title='Get Started'/>
    <section className="grid-entire-row">
      <h1 className="home-hero-text font-family-title">A place to store, share, and create recipes</h1>
    </section>
    <section className="grid-entire-row mb-4 d-flex justify-content-center">
      <Link to='/signup' className='my-button is-primary is-large'>
        Create Account
      </Link>
    </section>
    <section className="grid-entire-row">
      <img className="box-shadow-normal" src="/homepage.png" alt=""/>
    </section>
    <footer className="has-text-centered grid-entire-row fw-bold pt-4 fs-4 font-family-title">
      Est. 2017
    </footer>
  </section>

export default LandingPage
