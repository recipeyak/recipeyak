import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom'

import Home from './Home.js'
import Login from './Login.js'
import Signup from './Signup.js'
import RecipeList from './RecipeList.js'
import NoMatch from './NoMatch.js'
import Recipe from './Recipe.js'

const Base = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={ Home }/>
      <Route path="/login" component={ Login }/>
      <Route path="/signup" component={ Signup }/>
      <Route path="/recipes/" component={ RecipeList }/>
      <Route path="/recipe" component={ Recipe }/>
      <Route component={ NoMatch }/>
    </Switch>
  </Router>
)
export default Base
