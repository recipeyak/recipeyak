import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom'

import Home from './Home.jsx'
import Login from './LoginSignup.jsx'
import RecipeList from './RecipeList.jsx'
import NoMatch from './NoMatch.jsx'
import Ingredients from './Ingredients.jsx'
import Cart from './Cart.jsx'
import Recipe from './Recipe.jsx'

const Base = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={ Home }/>
      <Route path="/login" component={ Login }/>
      <Route path="/signup" component={ Login }/>
      <Route exact path="/recipes/" component={ RecipeList }/>
      <Route path="/cart" component={ Cart }/>
      <Route path="/ingredients" component={ Ingredients }/>
      <Route path="/recipes/:id" component={ Recipe }/>
      <Route component={ NoMatch }/>
    </Switch>
  </Router>
)
export default Base
