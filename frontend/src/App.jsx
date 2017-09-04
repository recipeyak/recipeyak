import React from 'react'
import {
  Route,
  Switch,
} from 'react-router-dom'
import {
  ConnectedRouter,
} from 'react-router-redux'

import { history } from './store.js'

import Home from './Home.jsx'
import Login from './containers/LoginSignup.jsx'
import RecipeList from './containers/RecipeList.jsx'
import NoMatch from './NoMatch.jsx'
import Ingredients from './containers/IngredientsList.jsx'
import Cart from './containers/Cart.jsx'
import Recipe from './containers/Recipe.jsx'
import PasswordReset from './PasswordReset.jsx'
import Settings from './Settings.jsx'
import AddRecipe from './containers/AddRecipe.jsx'

import './main.scss'

const Base = () => (
  <ConnectedRouter history={history}>
    <Switch>
      <Route exact path="/" component={ Home }/>
      <Route path="/login" component={ Login }/>
      <Route exact path="/recipes/add" component={ AddRecipe }/>
      <Route path="/password-reset" component={ PasswordReset }/>
      <Route path="/signup" component={ Login }/>
      <Route exact path="/recipes/" component={ RecipeList }/>
      <Route path="/cart" component={ Cart }/>
      <Route path="/ingredients" component={ Ingredients }/>
      <Route path="/recipes/:id" component={ Recipe }/>
      <Route path="/settings" component={ Settings }/>
      <Route component={ NoMatch }/>
    </Switch>
  </ConnectedRouter>
)
export default Base
