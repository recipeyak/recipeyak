import React from 'react'
import {
  Route,
  Switch,
  Redirect,
} from 'react-router-dom'
import {
  ConnectedRouter,
} from 'react-router-redux'

import { history, store } from '../store/store.js'

import Home from '../containers/Home.jsx'
import Login from '../containers/Login.jsx'
import Signup from '../containers/Signup.jsx'
import RecipeList from '../containers/RecipeList.jsx'
import NoMatch from './NoMatch.jsx'
import Ingredients from '../containers/IngredientsList.jsx'
import Cart from '../containers/Cart.jsx'
import Recipe from '../containers/Recipe.jsx'
import PasswordReset from './PasswordReset.jsx'
import Settings from './Settings.jsx'
import AddRecipe from '../containers/AddRecipe.jsx'

import './main.scss'

const isAuthenticated = () => store.getState().user.token != null

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => {
    return isAuthenticated()
      ? <Component {...props}/>
      : <Redirect to={{
        pathname: '/login',
        state: { from: props.location },
      }}/>
  }}/>
)

const Base = () => (
  <ConnectedRouter history={history}>
    <Switch>
      <Route exact path="/" component={ Home }/>
      <Route exact path="/login" component={ Login }/>
      <PrivateRoute exact path="/recipes/add" component={ AddRecipe }/>
      <Route exact path="/password-reset" component={ PasswordReset }/>
      <Route exact path="/signup" component={ Signup }/>
      <PrivateRoute exact path="/recipes/" component={ RecipeList }/>
      <PrivateRoute exact path="/cart" component={ Cart }/>
      <PrivateRoute exact path="/ingredients" component={ Ingredients }/>
      <PrivateRoute exact path="/recipes/:id" component={ Recipe }/>
      <PrivateRoute exact path="/settings" component={ Settings }/>
      <Route component={ NoMatch }/>
    </Switch>
  </ConnectedRouter>
)
export default Base
