import { render, screen, waitFor } from "@testing-library/react"
import Login from "@/components/Login"
import { ConnectedRouter } from "connected-react-router"
import { history } from "@/store/store"
import store from "@/store/store"
import { Provider } from "react-redux"
import { HelmetProvider } from "react-helmet-async"

import { IUserResponse } from "@/api"
import { server, rest } from "@/testUtils"
import userEvent from "@testing-library/user-event"

test("login success", async () => {
  server.use(
    rest.post(
      "http://localhost:3000/api/v1/auth/login",
      async (req, res, ctx) => {
        const requestJson = await req.json()
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
              selected_team: null,
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
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <HelmetProvider>
          <Login />
        </HelmetProvider>
      </ConnectedRouter>
    </Provider>,
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
        const requestJson = await req.json()
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
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <HelmetProvider>
          <Login />
        </HelmetProvider>
      </ConnectedRouter>
    </Provider>,
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
