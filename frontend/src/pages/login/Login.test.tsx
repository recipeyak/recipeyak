import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { persistQueryClient } from "@tanstack/react-query-persist-client"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ConnectedRouter } from "connected-react-router"
import { HelmetProvider } from "react-helmet-async"
import { Provider } from "react-redux"

import { IUserResponse } from "@/api"
import Login from "@/pages/login/Login.page"
import store, { history } from "@/store/store"
import { rest, server } from "@/testUtils"

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
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
})

test("login success", async () => {
  server.use(
    rest.post(
      "http://localhost:3000/api/v1/auth/login",
      async (req, res, ctx) => {
        const requestJson = await req.json<{
          email?: string
          password?: string
        }>()
        if (
          typeof requestJson["email"] === "string" &&
          typeof requestJson["password"] === "string"
        ) {
          const user: IUserResponse = {
            user: {
              avatar_url: "",
              email: "foo@example.com",
              name: "",
              id: 123,
              dark_mode_enabled: false,
              schedule_team: null,
            },
          }
          return res(ctx.status(200), ctx.json(user))
        }
        return res(ctx.status(500))
      },
    ),
  )
  const user = userEvent.setup()

  render(
    <QueryClientProvider client={queryClientPersistent}>
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <HelmetProvider>
            <Login />
          </HelmetProvider>
        </ConnectedRouter>
      </Provider>
    </QueryClientProvider>,
  )
  // 1. fill out form
  await user.type(
    screen.getByPlaceholderText("rick.sanchez@me.com"),
    "foo@example.com",
  )
  await user.type(
    screen.getByPlaceholderText("Super secret password."),
    "password123",
  )
  // 2. submit form
  await user.click(screen.getByText("Submit"))

  // 3. check updated store with info aka success!
  expect(store.getState().router.location.pathname).toEqual("/")
  await waitFor(() => {
    expect(store.getState().user.email).toEqual("foo@example.com")
  })
})

test("login failure", async () => {
  server.use(
    rest.post(
      "http://localhost:3000/api/v1/auth/login",
      async (req, res, ctx) => {
        const requestJson = await req.json<{
          email?: string
          password?: string
        }>()
        if (
          typeof requestJson["email"] === "string" &&
          typeof requestJson["password"] === "string"
        ) {
          const error: {
            email?: string[]
            password1?: string[]
            non_field_errors?: string[]
          } = {
            email: ["invalid email"],
          }
          return res(ctx.status(400), ctx.json(error))
        }
        return res(ctx.status(500))
      },
    ),
  )
  const user = userEvent.setup()

  render(
    <QueryClientProvider client={queryClientPersistent}>
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <HelmetProvider>
            <Login />
          </HelmetProvider>
        </ConnectedRouter>
      </Provider>
    </QueryClientProvider>,
  )
  // 1. fill out form
  await user.type(
    screen.getByPlaceholderText("rick.sanchez@me.com"),
    "foo@example.com",
  )
  await user.type(
    screen.getByPlaceholderText("Super secret password."),
    "password123",
  )
  // 2. submit form
  await user.click(screen.getByText("Submit"))

  // 3. check error message
  await waitFor(() => {
    expect(screen.getByText("invalid email")).toBeInTheDocument()
  })

  // 4. ensure state wasn't updated
  expect(store.getState().user.email).toEqual("")
})
