import "@/components/scss/main.scss"

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { QueryClient, useIsRestoring } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import raven from "raven-js"
import React, { useEffect } from "react"
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
import { useIsLoggedIn, useUserTheme } from "@/hooks"
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
import {
  pathHome,
  pathLogin,
  pathPassword,
  pathPasswordConfirm,
  pathPasswordReset,
  pathRecipeAdd,
  pathRecipeDetail,
  pathRecipesList,
  pathSchedule,
  pathSettings,
  pathSignup,
  pathTeamCreate,
  pathTeamDetail,
  pathTeamInvite,
  pathTeamList,
  pathTeamSettings,
} from "@/paths"
import { theme, ThemeProvider, themeSet } from "@/theme"
import { Toaster } from "@/toast"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  },
})

const persister = createSyncStoragePersister({
  storage: localStorage,
  retry: ({ error }) => {
    raven.captureException(error, {
      extra: "problem persisting",
    })
    // eslint-disable-next-line no-console
    console.error("problem persisting")
    // eslint-disable-next-line no-console
    console.error(error)
    return undefined
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
              pathname: pathLogin({}),
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
              pathname: pathHome({}),
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

function AppRouter() {
  const theme = useUserTheme()
  useEffect(() => {
    themeSet(theme)
  }, [theme])
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
        <PublicOnlyRoute exact path={pathLogin.pattern} component={Login} />
        <PublicOnlyRoute
          exact
          path={pathSignup.pattern}
          component={SignupPage}
        />
        <Route
          exact
          path={pathPasswordReset.pattern}
          component={PasswordResetPage}
        />
        <Route
          exact
          path={pathPasswordConfirm.pattern}
          component={PasswordResetConfirmPage}
        />
        <ContainerBase>
          <Switch>
            <Route exact path={pathHome.pattern} component={Home} />
            <PrivateRoute
              exact
              path={pathSchedule.pattern}
              component={SchedulePage}
            />
            <Container>
              <Switch>
                <PrivateRoute
                  exact
                  path={pathRecipeAdd.pattern}
                  component={RecipeCreatePage}
                />
                <PrivateRoute
                  exact
                  path={pathRecipesList.pattern}
                  component={RecipeListPage}
                />
                <PrivateRoute
                  exact
                  path={pathRecipeDetail.pattern}
                  component={RecipeDetailPage}
                />
                <PrivateRoute
                  exact
                  path={pathSettings.pattern}
                  component={SettingsPage}
                />
                <PrivateRoute
                  exact
                  path={pathPassword.pattern}
                  component={PasswordChangePage}
                />
                <PrivateRoute
                  exact
                  path={pathTeamCreate.pattern}
                  component={TeamCreatePage}
                />
                <PrivateRoute
                  exact
                  path={pathTeamInvite.pattern}
                  component={TeamInvitePage}
                />
                <PrivateRoute
                  exact
                  path={pathTeamSettings.pattern}
                  component={TeamDetailPage}
                />
                <PrivateRoute
                  exact
                  path={pathTeamDetail.pattern}
                  component={TeamDetailPage}
                />
                <PrivateRoute
                  exact
                  path={pathTeamList.pattern}
                  component={TeamsListPage}
                />
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
        buster: "2022-01-16",
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
              <AppRouter />
            </ErrorBoundary>
          </DndProvider>
        </HelmetProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  )
}

export default Base
