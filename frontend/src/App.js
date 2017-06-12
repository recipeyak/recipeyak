import React from 'react'
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom'

import Home from './Home.js'
import Login from './Login.js'
import Signup from './Signup.js'

const Base = () => (
  <Router>
    <div>
      <Route exact path="/" component={ Home }/>
      <Route path="/login" component={ Login }/>
      <Route path="/signup" component={ Signup }/>
    </div>
  </Router>
)
export default Base
