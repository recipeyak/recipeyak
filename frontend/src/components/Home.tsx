import * as React from 'react'

import LandingPage from './LandingPage'
import UserHome from '../containers/UserHome'

const Home = ({ loggedIn }) =>
  loggedIn
    ? <UserHome/>
    : <LandingPage/>

export default Home
