import "@/components/scss/main.scss"

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { persistQueryClient } from "@tanstack/react-query-persist-client"
import { ConnectedRouter } from "connected-react-router"
import React from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { HelmetProvider } from "react-helmet-async"
import { connect, Provider } from "react-redux"
import {
  Redirect,
  Route as BaseRoute,
  RouteComponentProps,
  RouteProps,
  Switch,
  useHistory,
} from "react-router-dom"

import { Container, ContainerBase } from "@/components/Base"
import ErrorBoundary from "@/components/ErrorBoundary"
import { Helmet } from "@/components/Helmet"
import Notification from "@/components/Notification"
import NotFound from "@/pages/404/404.page"
import Home from "@/pages/index/Index.page"
import Login from "@/pages/login/Login.page"
import PasswordChangePage from "@/pages/password-change/PasswordChange.page"
import PasswordResetPage from "@/pages/password-reset/PasswordReset.page"
import PasswordResetConfirmPage from "@/pages/password-reset-confirm/PasswordResetConfirm.page"
import PasswordSet from "@/pages/password-set/PasswordSet.page"
import RecipeCreatePage from "@/pages/recipe-create/RecipeCreate.page"
import RecipeDetailPage from "@/pages/recipe-detail/RecipeDetail.page"
import RecipeListPage from "@/pages/recipe-list/RecipeList.page"
import SchedulePage from "@/pages/schedule/Schedule.page"
import SettingsPage from "@/pages/settings/Settings.page"
import SignupPage from "@/pages/signup/Signup.page"
import TeamCreatePage from "@/pages/team-create/TeamCreate.page"
import TeamDetailPage from "@/pages/team-detail/TeamDetail.page"
import TeamInvitePage from "@/pages/team-invite/TeamInvite.page"
import TeamsListPage from "@/pages/team-list/TeamList.page"
import store, { history, IState } from "@/store/store"
import { theme, ThemeProvider } from "@/theme"

interface IAuthRouteProps extends Pick<RouteProps, "exact" | "path"> {
  readonly authenticated: boolean
  readonly component: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | React.ComponentType<RouteComponentProps<any>>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | React.ComponentType<any>
}

const queryClientPersistent = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  },
})

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
})

persistQueryClient({
  queryClient: queryClientPersistent,
  persister: localStoragePersister,
})

const mapAuthenticated = (state: IState) => ({
  authenticated: state.user.loggedIn,
})

const PrivateRoute = connect(mapAuthenticated)(
  ({ component: Component, authenticated, ...rest }: IAuthRouteProps) => (
    <BaseRoute
      {...rest}
      render={(props) => {
        return authenticated ? (
          <>
            <ScrollRestore />
            <Component {...props} />
          </>
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
  ({ component: Component, authenticated, ...rest }: IAuthRouteProps) => (
    <BaseRoute
      {...rest}
      render={(props) => {
        return !authenticated ? (
          <>
            <ScrollRestore />
            <Component {...props} />
          </>
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

const Route = connect(mapAuthenticated)(
  ({
    component: Component,
    ...rest
  }: Omit<IAuthRouteProps, "authenticated">) => (
    <BaseRoute
      {...rest}
      render={(props) => {
        return (
          <>
            <ScrollRestore />
            <Component {...props} />
          </>
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
    <QueryClientProvider client={queryClientPersistent}>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <HelmetProvider>
            <DndProvider backend={HTML5Backend}>
              <ErrorBoundary>
                <Helmet />
                <ConnectedRouter history={history}>
                  <Switch>
                    <PublicOnlyRoute exact path="/login" component={Login} />
                    <PublicOnlyRoute
                      exact
                      path="/signup"
                      component={SignupPage}
                    />
                    <Route
                      exact
                      path="/password-reset"
                      component={PasswordResetPage}
                    />
                    <ContainerBase>
                      <Switch>
                        <Route exact path="/" component={Home} />
                        <PrivateRoute
                          exact
                          path="/schedule/:type(shopping|recipes)?"
                          component={SchedulePage}
                        />
                        <PrivateRoute
                          exact
                          path="/t/:id(\d+)(.*)/schedule/:type(shopping|recipes)?"
                          component={SchedulePage}
                        />
                        <Container>
                          <Switch>
                            <Route
                              exact
                              path="/password-reset/confirm/:uid/:token"
                              component={PasswordResetConfirmPage}
                            />
                            <PrivateRoute
                              exact
                              path="/recipes/add"
                              component={RecipeCreatePage}
                            />
                            <PrivateRoute
                              exact
                              path="/recipes/"
                              component={RecipeListPage}
                            />
                            <PrivateRoute
                              exact
                              path="/recipes/:id(\d+)(.*)"
                              component={RecipeDetailPage}
                            />
                            <PrivateRoute
                              exact
                              path="/settings"
                              component={SettingsPage}
                            />
                            <PrivateRoute
                              exact
                              path="/password"
                              component={PasswordChangePage}
                            />
                            <PrivateRoute
                              exact
                              path="/password/set"
                              component={PasswordSet}
                            />
                            <PrivateRoute
                              exact
                              path="/t/create"
                              component={TeamCreatePage}
                            />
                            <PrivateRoute
                              exact
                              path="/t/:id(\d+)(.*)/invite"
                              component={TeamInvitePage}
                            />
                            <PrivateRoute
                              exact
                              path="/t/:id(\d+)(.*)/settings"
                              component={TeamDetailPage}
                            />
                            <PrivateRoute
                              exact
                              path="/t/:id(\d+)(.*)"
                              component={TeamDetailPage}
                            />
                            <PrivateRoute
                              exact
                              path="/t/"
                              component={TeamsListPage}
                            />
                            <Route component={NotFound} />
                          </Switch>
                        </Container>
                      </Switch>
                    </ContainerBase>
                  </Switch>
                </ConnectedRouter>
                <Notification />
              </ErrorBoundary>
            </DndProvider>
          </HelmetProvider>
        </Provider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default Base
