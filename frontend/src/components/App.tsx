import "@/components/scss/main.scss"

import * as Sentry from "@sentry/react"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { useIsRestoring } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { AblyProvider } from "ably/react"
import { createBrowserHistory } from "history"
import React, { Suspense, useEffect, useLayoutEffect } from "react"
import { RouterProvider } from "react-aria-components"
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
  useHistory,
} from "react-router-dom"

import { useIsLoggedIn } from "@/auth"
import { client as ablyClient } from "@/components/ably"
import { AlgoliaProvider } from "@/components/AlgoliaProvider"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Helmet } from "@/components/Helmet"
import { queryClient } from "@/components/queryClient"
import { ScrollRestore } from "@/components/ScrollRestore"
import { HomePage } from "@/pages/index/Index.page"
import { LoginPage } from "@/pages/login/Login.page"
import {
  pathCookDetail,
  pathDeprecatedSchedule,
  pathHome,
  pathLogin,
  pathPassword,
  pathPasswordConfirm,
  pathPasswordReset,
  pathProfileById,
  pathProfileByIdComments,
  pathProfileByIdPhotos,
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
import { useUserFetch } from "@/queries/useUserFetch"
import { API_GIT_TREE_SHA, GIT_SHA, SENTRY_DSN } from "@/settings"
import { themeSet } from "@/theme"
import { Toaster } from "@/toast"
import { useUserTheme } from "@/useUserTheme"

// Pages other than the home & login pages are split into their own chunks so
// the initial page load doesn't have to download & parse the entire app.
const lazyPages: Array<() => Promise<unknown>> = []
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyPage<T extends React.ComponentType<any>>(
  load: () => Promise<{ default: T }>,
) {
  lazyPages.push(load)
  return React.lazy(load)
}

/**
 * Load the remaining pages after the current page has settled so navigation is
 * instant, without competing with the current page's requests.
 */
function usePreloadPages() {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const preload = () => {
      timeoutId = setTimeout(() => {
        for (const load of lazyPages) {
          void load()
        }
      }, 3000)
    }
    if (document.readyState === "complete") {
      preload()
    } else {
      window.addEventListener("load", preload, { once: true })
    }
    return () => {
      window.removeEventListener("load", preload)
      clearTimeout(timeoutId)
    }
  }, [])
}

const NotFoundPage = lazyPage(() =>
  import("@/pages/404/404.page").then((m) => ({ default: m.NotFoundPage })),
)
const CookDetailPage = lazyPage(() =>
  import("@/pages/cook-detail/CookDetail.page").then((m) => ({
    default: m.CookDetailPage,
  })),
)
const PasswordChangePage = lazyPage(() =>
  import("@/pages/password-change/PasswordChange.page").then((m) => ({
    default: m.PasswordChangePage,
  })),
)
const PasswordResetPage = lazyPage(() =>
  import("@/pages/password-reset/PasswordReset.page").then((m) => ({
    default: m.PasswordResetPage,
  })),
)
const PasswordResetConfirmPage = lazyPage(() =>
  import("@/pages/password-reset-confirm/PasswordResetConfirm.page").then(
    (m) => ({ default: m.PasswordResetConfirmPage }),
  ),
)
const ProfilePage = lazyPage(() =>
  import("@/pages/profile/Profile.page").then((m) => ({
    default: m.ProfilePage,
  })),
)
const RecipeCreatePage = lazyPage(() =>
  import("@/pages/recipe-create/RecipeCreate.page").then((m) => ({
    default: m.RecipeCreatePage,
  })),
)
const RecipeDetailPage = lazyPage(() =>
  import("@/pages/recipe-detail/RecipeDetail.page").then((m) => ({
    default: m.RecipeDetailPage,
  })),
)
const RecipeListPage = lazyPage(() =>
  import("@/pages/recipe-list/RecipeList.page").then((m) => ({
    default: m.RecipeListPage,
  })),
)
const SchedulePage = lazyPage(() =>
  import("@/pages/schedule/Schedule.page").then((m) => ({
    default: m.SchedulePage,
  })),
)
const SettingsPage = lazyPage(() =>
  import("@/pages/settings/Settings.page").then((m) => ({
    default: m.SettingsPage,
  })),
)
const SignupPage = lazyPage(() =>
  import("@/pages/signup/Signup.page").then((m) => ({ default: m.SignupPage })),
)
const TeamCreatePage = lazyPage(() =>
  import("@/pages/team-create/TeamCreate.page").then((m) => ({
    default: m.TeamCreatePage,
  })),
)
const TeamDetailPage = lazyPage(() =>
  import("@/pages/team-detail/TeamDetail.page").then((m) => ({
    default: m.TeamDetailPage,
  })),
)
const TeamInvitePage = lazyPage(() =>
  import("@/pages/team-invite/TeamInvite.page").then((m) => ({
    default: m.TeamInvitePage,
  })),
)
const TeamListPage = lazyPage(() =>
  import("@/pages/team-list/TeamList.page").then((m) => ({
    default: m.TeamListPage,
  })),
)
const UserCommentsPage = lazyPage(() =>
  import("@/pages/user-comments/UserComments.page").then((m) => ({
    default: m.UserCommentsPage,
  })),
)
const UserUploadsPage = lazyPage(() =>
  import("@/pages/user-comments/UserUploads.page").then((m) => ({
    default: m.UserUploadsPage,
  })),
)

const history = createBrowserHistory()
const BaseRoute = Sentry.withSentryRouting(RRBaseRoute)

Sentry.init({
  dsn: SENTRY_DSN,
  release: GIT_SHA || "",
  integrations: [
    Sentry.extraErrorDataIntegration(),
    Sentry.reactRouterV5BrowserTracingIntegration({ history }),
    Sentry.feedbackIntegration({
      autoInject: false,
      showBranding: false,
      showName: false,
      // form text
      formTitle: "Send Feedback",
      submitButtonLabel: "Send Feedback",
    }),
  ],
  tracesSampleRate: 1.0,
})
// eslint-disable-next-line no-console
console.log(
  "version:",
  GIT_SHA,
  "\nsentry:",
  SENTRY_DSN,
  "\ntree sha:",
  API_GIT_TREE_SHA,
)

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

function Routes() {
  let history = useHistory()

  return (
    <RouterProvider navigate={history.push}>
      <Suspense fallback={null}>
        <Switch>
          <PublicOnlyRoute
            exact
            path={pathLogin.pattern}
            component={LoginPage}
          />
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
                path={pathProfileByIdComments.pattern}
                component={UserCommentsPage}
              />
              <PrivateRoute
                exact
                path={pathProfileByIdPhotos.pattern}
                component={UserUploadsPage}
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
      </Suspense>
    </RouterProvider>
  )
}

function AppRouter() {
  const theme = useUserTheme()
  useLayoutEffect(() => {
    themeSet(theme)
  }, [theme])
  const isRestoring = useIsRestoring()
  const isLoggedIn = useIsLoggedIn()
  const user = useUserFetch()
  usePreloadPages()
  if (isRestoring) {
    // NOTE: we don't render the site until react-query finishes hydrating from cache
    // some sites like linear show a loader, but they must guarentee it shows
    // for $N milliseconds or something because when it's really quick, < $N
    // milliseconds it looks like a glitchy flash
    return null
  }
  if (isLoggedIn && user.isPending && user.failureCount === 0) {
    // Most queries are keyed by the user's team, so wait for the user to load
    // instead of fetching everything with a placeholder team and then again
    // with the real one. If the request fails, render anyway rather than
    // showing a blank page while it retries.
    return null
  }
  return (
    <Router history={history}>
      <Routes />
    </Router>
  )
}

function App() {
  return (
    // Wrap with Suspsense to help in development with hot reloading.
    //
    // A component suspended while responding to synchronous input. This will cause the UI to
    <Suspense>
      <AblyProvider client={ablyClient}>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            // NOTE: Ideally we'd only bust the cache when the cache schema changes
            // in a backwards incompatible way but calculating that is annoying so
            // just break it on every deploy
            buster: API_GIT_TREE_SHA,
            persister,
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            dehydrateOptions: {
              // see: https://github.com/TanStack/query/discussions/3735#discussioncomment-3007804
              shouldDehydrateQuery: (query) => {
                const skipPersistence =
                  query?.meta?.["skipPersistence"] ?? false
                if (skipPersistence) {
                  return false
                }
                // default implementation
                return query.state.status === "success"
              },
            },
          }}
        >
          <AlgoliaProvider>
            <HelmetProvider>
              <DndProvider backend={HTML5Backend}>
                <ErrorBoundary>
                  <Helmet />
                  <Toaster
                    toastOptions={{
                      position: "bottom-center",
                      className:
                        "!bg-[--color-background-card] !text-[--color-text] !border-[--color-border]",
                    }}
                  />
                  <AppRouter />
                </ErrorBoundary>
              </DndProvider>
            </HelmetProvider>
          </AlgoliaProvider>
        </PersistQueryClientProvider>
      </AblyProvider>
    </Suspense>
  )
}

const AppWithSentry = Sentry.withProfiler(App)

export default AppWithSentry
