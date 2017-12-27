import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

const isOdd = i => i % 2 !== 0

const LandingPage = () =>
  <section className="home-grid">
    <Helmet title='Get Started'/>
    <section className="">
      <h1 className="home-hero-text font-family-title">A place to store, share, and create recipes</h1>
    </section>
    <section className="mb-4 d-flex justify-content-center">
      <Link to='/signup' className='my-button is-primary is-large'>
        Create Account
      </Link>
    </section>
    <section>
      <img className="box-shadow-normal" src="/homepage.png" alt=""/>
    </section>
    <h2 className="font-family-title fs-12 bold">Features</h2>
    <ul className="d-grid grid-gap-1rem">
    {
      [
        {
          text: 'Sift through through your entire recipe collection in milliseconds with the enhanced search box.',
          imgURL: '/search.png'
        },
        {
          text: 'Keep all your recipes in one place with unlimited recipe storage',
          imgURL: '/list.png'
        },
        {
          text: 'Automatically generate a condensed shopping list by adding recipes to your cart.',
          imgURL: '/cart.png'
        },
        {
          text: 'Easily double recipes and have the resulting ingredients appear in your shopping list',
          imgURL: '/cart-doubling.png'
        }
      ].map(({ text, imgURL }, i) =>
        <li className="feature-grid">
          <p className={ `align-self-center ${isOdd(i) ? 'grid-column-2 grid-row-1' : ''}` }>{ text }</p>
          <div className="fact-img align-self-center ">
            <img className="box-shadow-normal " src={ imgURL } alt=""/>
          </div>
        </li>
      )
    }
    </ul>
    <h2 className="font-family-title fs-12 bold">How it works</h2>
    <ol className="d-grid grid-gap-2rem">
    {
      [
        {
          text: "After logging in, add your recipes to the store via the 'Add Recipe' form.",
          imgURL: '/add-recipe.png'
        },
        {
          text: 'Search through your recipe list and add recipes to your cart.',
          imgURL: '/search.png'
        },
        {
          text: 'Double any necessary recipes and print the automatically generated shopping list.',
          imgURL: '/cart-doubling.png'
        }
      ].map(({ text, imgURL }, i) =>
        <li className="feature-grid">
          <p className="align-self-center"><b>{ i + 1 }{ '. ' }</b>{ text }</p>
          <div className="fact-img">
            <img className="box-shadow-normal " src={ imgURL } alt=""/>
          </div>
        </li>
      )
    }
    </ol>
    <footer className="has-text-centered  fw-bold pt-4 fs-4 font-family-title">
      Est. 2017
    </footer>
  </section>

export default LandingPage
