import "@/components/scss/main.scss"

import * as Sentry from "@sentry/react"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { useIsRestoring } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { createBrowserHistory } from "history"
import React, { Suspense, useLayoutEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { HelmetProvider } from "react-helmet-async"
import {
  Redirect,
  Route as RRBaseRoute,
  RouteComponentProps,
  RouteProps,
  Router,
  Switch,
} from "react-router-dom"

import { useIsLoggedIn } from "@/auth"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Helmet } from "@/components/Helmet"
import { queryClient } from "@/components/queryClient"
import { ScrollRestore } from "@/components/ScrollRestore"
import { NotFoundPage } from "@/pages/404/404.page"
import { CookDetailPage } from "@/pages/cook-detail/CookDetail.page"
import { HomePage } from "@/pages/index/Index.page"
import { LoginPage } from "@/pages/login/Login.page"
import { PasswordChangePage } from "@/pages/password-change/PasswordChange.page"
import { PasswordResetPage } from "@/pages/password-reset/PasswordReset.page"
import { PasswordResetConfirmPage } from "@/pages/password-reset-confirm/PasswordResetConfirm.page"
import { ProfilePage } from "@/pages/profile/Profile.page"
import { RecipeCreatePage } from "@/pages/recipe-create/RecipeCreate.page"
import { RecipeDetailPage } from "@/pages/recipe-detail/RecipeDetail.page"
import { RecipeListPage } from "@/pages/recipe-list/RecipeList.page"
import { SchedulePage } from "@/pages/schedule/Schedule.page"
import { SettingsPage } from "@/pages/settings/Settings.page"
import { SignupPage } from "@/pages/signup/Signup.page"
import { TeamCreatePage } from "@/pages/team-create/TeamCreate.page"
import { TeamDetailPage } from "@/pages/team-detail/TeamDetail.page"
import { TeamInvitePage } from "@/pages/team-invite/TeamInvite.page"
import { TeamListPage } from "@/pages/team-list/TeamList.page"
import {
  pathCookDetail,
  pathDeprecatedSchedule,
  pathHome,
  pathLogin,
  pathPassword,
  pathPasswordConfirm,
  pathPasswordReset,
  pathProfileById,
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
import { GIT_SHA, SENTRY_DSN } from "@/settings"
import { theme, ThemeProvider, themeSet } from "@/theme"
import { Toaster } from "@/toast"
import { useUserTheme } from "@/useUserTheme"

const history = createBrowserHistory()
const BaseRoute = Sentry.withSentryRouting(RRBaseRoute)

Sentry.init({
  dsn: SENTRY_DSN,
  release: GIT_SHA || "",
  integrations: [
    new Sentry.BrowserTracing({
      // See docs for support of different versions of variation of react router
      // https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/react-router/
      routingInstrumentation: Sentry.reactRouterV5Instrumentation(history),
    }),
  ],
  tracesSampleRate: 1.0,
})
// eslint-disable-next-line no-console
console.log("version:", GIT_SHA, "\nsentry:", SENTRY_DSN)

const persister = createSyncStoragePersister({
  // eslint-disable-next-line no-restricted-globals
  storage: localStorage,
  retry: ({ error }) => {
    Sentry.captureException(error)
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
  useLayoutEffect(() => {
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
    <Router history={history}>
      <Switch>
        <PublicOnlyRoute exact path={pathLogin.pattern} component={LoginPage} />
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
        <Switch>
          <Route exact path={pathHome.pattern} component={HomePage} />
          <PrivateRoute
            exact
            path={pathSchedule.pattern}
            component={SchedulePage}
          />
          <Route
            path={pathDeprecatedSchedule.pattern}
            component={() => (
              <Redirect
                to={{
                  pathname: pathSchedule({}),
                }}
              />
            )}
          />
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
              path={pathCookDetail.pattern}
              component={CookDetailPage}
            />
            <PrivateRoute
              exact
              path={pathSettings.pattern}
              component={SettingsPage}
            />
            <PrivateRoute
              exact
              path={pathProfileById.pattern}
              component={ProfilePage}
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
              component={TeamListPage}
            />
            <Route component={NotFoundPage} />
          </Switch>
        </Switch>
      </Switch>
    </Router>
  )
}

function App() {
  return (
    // Wrap with Suspsense to help in development with hot reloading.
    //
    // A component suspended while responding to synchronous input. This will cause the UI to
    <Suspense>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          // NOTE: Ideally we'd only bust the cache when the cache schema changes
          // in a backwards incompatible way but calculating that is annoying so
          // just break it on every deploy
          buster: GIT_SHA,
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
    </Suspense>
  )
}

const AppWithSentry = Sentry.withProfiler(App)

export default AppWithSentry
