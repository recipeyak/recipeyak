import React from 'react'

const Home = () => (
  <div>

    <div className="hero">
      <nav className="grid container">
          <h1 className="col-xs-2">
            <a className="nav-item" href='/'>Caena</a>
          </h1>

          <div className="col-xs-10 nav-right">
            <a className="nav-item" href='/signup'>Signup</a>
            <a className="nav-item" href='/login'>Login</a>
          </div>
      </nav>

      <section className="container">
        <h2 className="hero-text">A place to store, share, and create recipes</h2>
        <img alt="interface in action" src="/list.png"></img>
      </section>

    </div>

    <section className="grid container">

      <div className="col-sm-4 col-xs-12 feature">
        <h3>Quick Imports</h3>
        <ul>
          <li>
            Store your recipes for safe keeping
          </li>
          <li>
            Import from popular sevices like NYTimes Cooking, All Recipes, and more.
          </li>
        </ul>
      </div>

      <div className="col-sm-4 col-xs-12 feature">
        <h3>Infinite Versioning</h3>
        <ul>
          <li>
            Tweak your recipes with infinite version history.
          </li>
          <li>
            Review any of your changes in an instant.
          </li>
        </ul>
      </div>

      <div className="col-sm-4 col-xs-12 feature">
        <h3>Automate shopping</h3>
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

    <footer className="center">
      Caena ※ 2017
    </footer>

  </div>
)

export default Home
