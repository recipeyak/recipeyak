import "@/components/scss/main.scss"

import { ConnectedRouter } from "connected-react-router"
import React from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { HelmetProvider } from "react-helmet-async"
import { connect, Provider } from "react-redux"
import { StaticContext } from "react-router"
import {
  Redirect,
  Route,
  RouteComponentProps,
  RouteProps,
  Switch,
  useHistory,
} from "react-router-dom"

import { Container, ContainerBase } from "@/components/Base"
import { CurrentKeys } from "@/components/CurrentKeys"
import ErrorBoundary from "@/components/ErrorBoundary"
import { Helmet } from "@/components/Helmet"
import HelpMenuModal from "@/components/HelpMenuModal"
import Login from "@/components/Login"
import NoMatch from "@/components/NoMatch"
import PasswordResetConfirmation from "@/components/PasswordResetConfirmation"
import Recipe from "@/components/Recipe"
import Recipes from "@/components/RecipeList"
import Schedule from "@/components/Schedule"
import TeamCreate from "@/components/TeamCreate"
import TeamInvite from "@/components/TeamInvite"
import Teams from "@/components/Teams"
import AddRecipe from "@/containers/AddRecipe"
import Home from "@/containers/Home"
import Notification from "@/containers/Notification"
import PasswordChange from "@/containers/PasswordChange"
import PasswordReset from "@/containers/PasswordReset"
import PasswordSet from "@/containers/PasswordSet"
import Settings from "@/containers/Settings"
import Signup from "@/containers/Signup"
import Team from "@/containers/Team"
import store, { history, IState } from "@/store/store"
import { theme, ThemeProvider } from "@/theme"

interface IAuthRouteProps extends RouteProps {
  readonly authenticated: boolean
}

const mapAuthenticated = (state: IState) => ({
  authenticated: state.user.loggedIn,
})

type ComponentProps = RouteComponentProps<
  {
    [x: string]: string | undefined
  },
  StaticContext,
  unknown
>

/** Return a ReactNode when provided a component or render function
 *
 * This utility function supports component and render props for React Router.
 */
const renderComponent = (
  props: ComponentProps,
  component: RouteProps["component"],
  render: RouteProps["render"],
): React.ReactNode => {
  if (component) {
    return React.createElement(component, props)
  }
  if (render) {
    return render(props)
  }
  return null
}

const PrivateRoute = connect(mapAuthenticated)(
  ({
    component: Component,
    render,
    authenticated,
    ...rest
  }: IAuthRouteProps) => (
    <Route
      {...rest}
      render={(props) => {
        return authenticated ? (
          renderComponent(props, Component, render)
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location },
            }}
          />
        )
      }}
    />
  ),
)

const PublicOnlyRoute = connect(mapAuthenticated)(
  ({
    component: Component,
    render,
    authenticated,
    ...rest
  }: IAuthRouteProps) => (
    <Route
      {...rest}
      render={(props) => {
        return !authenticated ? (
          renderComponent(props, Component, render)
        ) : (
          <Redirect
            to={{
              pathname: "/",
              state: { from: props.location },
            }}
          />
        )
      }}
    />
  ),
)

function ScrollRestore() {
  const history = useHistory()
  React.useEffect(() => {
    // using browser back/forward buttons results in a POP type
    if (history.action !== "POP") {
      window.scroll(0, 0)
    }
  }, [history.action])
  return null
}

function Base() {
  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <HelmetProvider>
          <DndProvider backend={HTML5Backend}>
            <ErrorBoundary>
              <Helmet />
              <CurrentKeys />
              <ConnectedRouter history={history}>
                <ScrollRestore />
                <Switch>
                  <PublicOnlyRoute exact path="/login" component={Login} />
                  <PublicOnlyRoute exact path="/signup" component={Signup} />
                  <Route
                    exact
                    path="/password-reset"
                    component={PasswordReset}
                  />
                  <ContainerBase>
                    <Switch>
                      <Route exact path="/" component={Home} />
                      <PrivateRoute
                        exact
                        path="/schedule/:type(shopping|recipes)?"
                        component={Schedule}
                      />
                      <PrivateRoute
                        exact
                        path="/t/:id(\d+)(.*)/schedule/:type(shopping|recipes)?"
                        component={Schedule}
                      />
                      <Container>
                        <Switch>
                          <Route
                            exact
                            path="/password-reset/confirm/:uid([0-9A-Za-z_\-]+).:token([0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})"
                            component={PasswordResetConfirmation}
                          />
                          <PrivateRoute
                            exact
                            path="/recipes/add"
                            component={AddRecipe}
                          />
                          <PrivateRoute
                            exact
                            path="/recipes/"
                            component={Recipes}
                          />
                          <PrivateRoute
                            exact
                            path="/recipes/:id(\d+)(.*)"
                            component={Recipe}
                          />
                          <PrivateRoute
                            exact
                            path="/settings"
                            component={Settings}
                          />
                          <PrivateRoute
                            exact
                            path="/password"
                            component={PasswordChange}
                          />
                          <PrivateRoute
                            exact
                            path="/password/set"
                            component={PasswordSet}
                          />
                          <PrivateRoute
                            exact
                            path="/t/create"
                            component={TeamCreate}
                          />
                          <PrivateRoute
                            exact
                            path="/t/:id(\d+)(.*)/invite"
                            component={TeamInvite}
                          />
                          <PrivateRoute
                            exact
                            path="/t/:id(\d+)(.*)/settings"
                            component={Team}
                          />
                          <PrivateRoute
                            exact
                            path="/t/:id(\d+)(.*)"
                            component={Team}
                          />
                          <PrivateRoute exact path="/t/" component={Teams} />
                          <Route component={NoMatch} />
                        </Switch>
                      </Container>
                    </Switch>
                  </ContainerBase>
                </Switch>
              </ConnectedRouter>
              <Notification />
              <HelpMenuModal />
            </ErrorBoundary>
          </DndProvider>
        </HelmetProvider>
      </Provider>
    </ThemeProvider>
  )
}

export default Base
