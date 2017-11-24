import React from 'react'

import Nav from '../containers/Nav'

import Signup from '../containers/HomeSignup'

import './home.scss'

const SimpleHome = ({ loggedIn = false }) => {
  return (
    <div className="container pl-4 pr-4">

      <Nav />

      <div className="home-grid font-family-serif ">
        <h1 className="home-hero-text">A place to store, share, and create recipes</h1>

        { !loggedIn
            ? <Signup />
            : (
              <div>
                {/* TODO: either put some metrics like: last week you did... or display favorite recipes */}
                <p>You have created 10 recipes in the last week</p>
              </div>
            )
        }

        <footer className="has-text-centered grid-entire-row fw-bold pt-4">
          Recipe Yak ※ 2017
        </footer>

      </div>
    </div>
  )
}

class Home extends React.Component {
  componentWillMount = () => {
    this.props.fetchData()
  }

  render () {
    return <SimpleHome {...this.props} />
  }
}

export default Home
