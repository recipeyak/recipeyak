import React from 'react'
import {
  Route,
  Switch,
  Redirect
} from 'react-router-dom'
import {
  ConnectedRouter
} from 'react-router-redux'
import { Helmet } from 'react-helmet'
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'

import { history, store } from '../store/store.js'

import Home from '../containers/Home.jsx'
import Login from '../containers/Login.jsx'
import Signup from '../containers/Signup.jsx'
import NoMatch from './NoMatch.jsx'
import Recipe from './Recipe'
import PasswordReset from '../containers/PasswordReset.jsx'
import Settings from '../containers/Settings'
import Team from '../containers/Team'
import TeamInvite from './TeamInvite'
import TeamCreate from './TeamCreate'
import AddRecipe from '../containers/AddRecipe.jsx'
import Notification from '../containers/Notification.jsx'
import { Container, ContainerBase } from '../components/Base.jsx'
import PasswordChange from '../containers/PasswordChange.jsx'
import PasswordSet from '../containers/PasswordSet.jsx'
import PasswordResetConfirmation from './PasswordResetConfirmation'
import OAuth from '../containers/OAuth.jsx'
import OAuthConnect from '../containers/OAuthConnect.jsx'
import Schedule from './Schedule'
import HelpMenuModal from './HelpMenuModal'

import './scss/main.scss'

const isAuthenticated = () => store.getState().user.loggedIn

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

const PublicOnlyRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => {
    return !isAuthenticated()
      ? <Component {...props}/>
      : <Redirect to={{
        pathname: '/',
        state: { from: props.location }
      }}/>
  }}/>
)

@DragDropContext(HTML5Backend)
export default class Base extends React.Component {
  render () {
    return (
      <div>
        <Helmet
          defaultTitle='Recipe Yak'
          titleTemplate='%s | Recipe Yak'
        />
        <ConnectedRouter history={ history }>
          <Switch>
            <PublicOnlyRoute exact path="/login" component={ Login }/>
            <PublicOnlyRoute exact path="/signup" component={ Signup }/>
            <Route exact path="/password-reset" component={ PasswordReset }/>
            <Route exact path="/accounts/:service" component={ OAuth }/>
            <ContainerBase>
              <Switch>
                <Route exact path="/" component={ Home }/>
                <PrivateRoute exact path="/schedule/:type(shopping|recipes)?" component={ Schedule }/>
                <PrivateRoute exact path="/t/:id(\d+)(.*)/schedule/:type(shopping|recipes)?" component={ Schedule }/>
                <Container>
                  <Switch>
                    <Route exact path="/accounts/:service/connect" component={ OAuthConnect }/>
                    <Route exact path="/password-reset/confirm/:uid([0-9A-Za-z_\-]+).:token([0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})" component={ PasswordResetConfirmation }/>
                    <PrivateRoute exact path="/recipes/add" component={ AddRecipe }/>
                    <PrivateRoute exact path="/recipes/:id(\d+)(.*)" component={ Recipe }/>
                    <PrivateRoute exact path="/settings" component={ Settings }/>
                    <PrivateRoute exact path="/password" component={ PasswordChange }/>
                    <PrivateRoute exact path="/password/set" component={ PasswordSet }/>
                    <Route exact path="/t/create" component={ TeamCreate }/>
                    <Route exact path="/t/:id(\d+)(.*)/invite" component={ TeamInvite }/>
                    <Route exact path="/t/:id(\d+)(.*)/settings" component={ Team }/>
                    <Route exact path="/t/:id(\d+)(.*)" component={ Team }/>
                    <Route component={ NoMatch }/>
                  </Switch>
                </Container>
              </Switch>
            </ContainerBase>
          </Switch>
        </ConnectedRouter>
        <Notification/>
        <HelpMenuModal/>
      </div>

    )
  }
}
