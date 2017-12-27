import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

const isOdd = i => i % 2 !== 0

const LandingPage = () =>
  <section>
    <Helmet title='Get Started'/>
    <section className="container d-grid grid-gap-1rem pb-4 pr-4 pl-4">
      <h1 className="home-hero-text font-family-title">A place to store, share, and create recipes</h1>

      <Link to='/signup' className='my-button is-primary is-large justify-self-center'>
        Create Account
      </Link>
    </section>
    <section className="pt-4 bg-50-50-primary pr-4 pl-4">
      <section className="container">
        <img className="box-shadow-normal" src="/homepage.png" alt=""/>
      </section>
    </section>

    <section className="bg-primary color-white pt-4 pb-4 pr-4 pl-4">
      <section className="container">
        <h2 className="font-family-title home-subtitle bold">Features</h2>
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
            <li className="feature-grid" key={ text }>
              <p className={ `align-self-center ${isOdd(i) ? 'grid-column-2 grid-row-1' : ''}` }>{ text }</p>
              <div className="fact-img align-self-center ">
                <img className="box-shadow-normal " src={ imgURL } alt=""/>
              </div>
            </li>
          )
        }
        </ul>
      </section>
    </section>

    <section className="pt-4 pr-4 pl-4">
      <section className="container d-grid">
        <h2 className="font-family-title home-subtitle bold">How it works</h2>
        <ol className="d-grid grid-gap-2rem">
        {
          [
            {
              text: <span>After logging in, add your recipes to the store via the <Link className="text-decoration-underline" to="/recipes/add">Add Recipe</Link> form.</span>,
              imgURL: '/add-recipe.png'
            },
            {
              text: <span>Search through your <Link to="/recipes" className="text-decoration-underline">recipe list</Link> and add recipes to your cart.</span>,
              imgURL: '/search.png'
            },
            {
              text: <span>Double any necessary recipes and print the automatically generated shopping list.</span>,
              imgURL: '/cart-doubling.png'
            }
          ].map(({ text, imgURL }, i) =>
            <li className="feature-grid" key={ imgURL }>
              <p className="align-self-center"><b>{ i + 1 }{ '. ' }</b>{ text }</p>
              <div className="fact-img">
                <img className="box-shadow-normal " src={ imgURL } alt=""/>
              </div>
            </li>
          )
        }
        </ol>

        <Link to='/signup' className='my-button is-primary is-large justify-self-center mt-4 mb-2'>
          Create Account
        </Link>
      </section>
    </section>

    <footer className="fw-bold pt-4 pb-4 fs-4 font-family-title d-flex space-between container pr-4 pl-4">
      <span>Recipe Yak</span>
      <span>Est. 2017</span>
    </footer>
  </section>

export default LandingPage
