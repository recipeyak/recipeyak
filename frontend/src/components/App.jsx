import React from 'react'
import {
  Route,
  Switch,
  Redirect
} from 'react-router-dom'
import {
  ConnectedRouter
} from 'react-router-redux'

import { history, store } from '../store/store.js'

import Home from '../containers/Home.jsx'
import Login from '../containers/Login.jsx'
import Signup from '../containers/Signup.jsx'
import RecipeList from '../containers/RecipeList.jsx'
import NoMatch from './NoMatch.jsx'
import Cart from '../containers/Cart.jsx'
import Recipe from '../containers/Recipe.jsx'
import PasswordReset from '../containers/PasswordReset.jsx'
import Settings from '../containers/Settings.jsx'
import AddRecipe from '../containers/AddRecipe.jsx'
import Notification from '../containers/Notification.jsx'
import HomePage from '../components/Base.jsx'
import PasswordChange from '../containers/PasswordChange.jsx'

import './main.scss'

const isAuthenticated = () => store.getState().user.token != null

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => {
    return isAuthenticated()
      ? <Component {...props}/>
      : <Redirect to={{
        pathname: '/login',
        state: { from: props.location }
      }}/>
  }}/>
)

const Base = () => (
<div>
  <ConnectedRouter history={ history }>
    <Switch>
      <Route exact path="/login" component={ Login }/>
      <Route exact path="/signup" component={ Signup }/>
      <Route exact path="/password-reset" component={ PasswordReset }/>
      <Route exact path="/" component={ Home }/>
      <HomePage>
        <Switch>
          <PrivateRoute exact path="/recipes/add" component={ AddRecipe }/>
          <PrivateRoute exact path="/recipes/" component={ RecipeList }/>
          <PrivateRoute exact path="/cart" component={ Cart }/>
          <PrivateRoute exact path="/recipes/:id" component={ Recipe }/>
          <PrivateRoute exact path="/settings" component={ Settings }/>
          <PrivateRoute exact path="/password" component={ PasswordChange }/>
          <Route component={ NoMatch }/>
        </Switch>
      </HomePage>
    </Switch>
  </ConnectedRouter>
  <Notification/>
</div>
)
export default Base
