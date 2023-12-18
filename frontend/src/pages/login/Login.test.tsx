import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { persistQueryClient } from "@tanstack/react-query-persist-client"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { HelmetProvider } from "react-helmet-async"
import { BrowserRouter, useLocation } from "react-router-dom"

import { LoginPage as Login } from "@/pages/login/Login.page"
import { IUserResponse } from "@/queries/authLogin"
import { rest, server } from "@/testUtils"

const queryClientPersistent = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
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

// from: https://testing-library.com/docs/example-react-router/#testing-library-and-react-router-v5
export const LocationDisplay = () => {
  const location = useLocation()
  return <div data-testid="location-display">{location.pathname}</div>
}

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
              schedule_team: null,
              theme_day: "light",
              theme_night: "dark",
              theme_mode: "single",
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
      <BrowserRouter>
        <HelmetProvider>
          <LocationDisplay />
          <Login />
        </HelmetProvider>
      </BrowserRouter>
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
  expect(screen.getByTestId("location-display")).toHaveTextContent("/")
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
      <BrowserRouter>
        <HelmetProvider>
          <Login />
        </HelmetProvider>
      </BrowserRouter>
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
})
