import "@/components/scss/main.scss"

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { QueryClient, useIsRestoring } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import raven from "raven-js"
import React from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { HelmetProvider } from "react-helmet-async"
import {
  BrowserRouter as Router,
  Redirect,
  Route as BaseRoute,
  RouteComponentProps,
  RouteProps,
  Switch,
} from "react-router-dom"

import { Container, ContainerBase } from "@/components/Base"
import ErrorBoundary from "@/components/ErrorBoundary"
import { Helmet } from "@/components/Helmet"
import { ScrollRestore } from "@/components/ScrollRestore"
import { useIsLoggedIn } from "@/hooks"
import NotFound from "@/pages/404/404.page"
import Home from "@/pages/index/Index.page"
import Login from "@/pages/login/Login.page"
import PasswordChangePage from "@/pages/password-change/PasswordChange.page"
import PasswordResetPage from "@/pages/password-reset/PasswordReset.page"
import PasswordResetConfirmPage from "@/pages/password-reset-confirm/PasswordResetConfirm.page"
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
import { theme, ThemeProvider } from "@/theme"
import { Toaster } from "@/toast"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  },
})

const persister = createSyncStoragePersister({
  storage: {
    getItem: (key: string): string | null => {
      return localStorage.getItem(key)
    },
    setItem: (key: string, value: string): void => {
      try {
        localStorage.setItem(key, value)
      } catch (e) {
        raven.captureException(e, {
          extra: { key },
        })
        throw e
      }
    },
    removeItem: (key: string): void => {
      localStorage.removeItem(key)
    },
  },
  serialize: (client) => {
    try {
      return JSON.stringify(client)
    } catch (e) {
      raven.captureException(e, {
        extra: { serializationFailed: true },
      })
      throw e
    }
  },
  deserialize: (client) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(client)
    } catch (e) {
      raven.captureException(e, {
        extra: { deserializingFailed: true },
      })
      throw e
    }
  },
})

interface IAuthRouteProps extends Pick<RouteProps, "exact" | "path"> {
  readonly component: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | React.ComponentType<RouteComponentProps<any>>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | React.ComponentType<any>
}

const PrivateRoute = ({ component: Component, ...rest }: IAuthRouteProps) => {
  const authenticated = useIsLoggedIn()
  return (
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
  )
}

const PublicOnlyRoute = ({
  component: Component,
  ...rest
}: IAuthRouteProps) => {
  const authenticated = useIsLoggedIn()
  return (
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
  )
}

const Route = ({
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
)

function AppContent() {
  const isRestoring = useIsRestoring()
  if (isRestoring) {
    // NOTE: we don't render the site until react-query finishes hydrating from cache
    // some sites like linear show a loader, but they must guarentee it shows
    // for $N milliseconds or something because when it's really quick, < $N
    // milliseconds it looks like a glitchy flash
    return null
  }
  return (
    <Router>
      <Switch>
        <PublicOnlyRoute exact path="/login" component={Login} />
        <PublicOnlyRoute exact path="/signup" component={SignupPage} />
        <Route exact path="/password-reset" component={PasswordResetPage} />
        <ContainerBase>
          <Switch>
            <Route exact path="/" component={Home} />
            <PrivateRoute
              exact
              // TODO: `:type` isn't used anymore
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
                <PrivateRoute exact path="/settings" component={SettingsPage} />
                <PrivateRoute
                  exact
                  path="/password"
                  component={PasswordChangePage}
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
                <PrivateRoute exact path="/t/" component={TeamsListPage} />
                <Route component={NotFound} />
              </Switch>
            </Container>
          </Switch>
        </ContainerBase>
      </Switch>
    </Router>
  )
}

function Base() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        dehydrateOptions: {
          // see: https://github.com/TanStack/query/discussions/3735#discussioncomment-3007804
          shouldDehydrateQuery: (query) => {
            // NOTE: list endpoint for recipes is huge, like 2MB for 400ish recipes
            // we manually cache each recipe but don't include the list itself as that
            // doubles the total storage and there's only 5MB of localStorage to work
            // with.
            if (query.queryKey.includes("recipes-list")) {
              return false
            }
            // default implementation
            return query.state.status === "success"
          },
        },
      }}
    >
      <ReactQueryDevtools initialIsOpen={false} />
      <ThemeProvider theme={theme}>
        <HelmetProvider>
          <DndProvider backend={HTML5Backend}>
            <ErrorBoundary>
              <Helmet />
              <Toaster toastOptions={{ position: "bottom-center" }} />
              <AppContent />
            </ErrorBoundary>
          </DndProvider>
        </HelmetProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  )
}

export default Base
