import React from "react"
import { MemoryRouter } from "react-router"
import { Provider } from "react-redux"
import { mount } from "enzyme"

import { emptyStore as store } from "../store/store"

import PasswordReset from "./PasswordReset"

describe("<PasswordReset/>", () => {
  it("renders without crashing", () => {
    const props = {
      error: {},
      loading: false,
      reset: () => undefined
    }
    mount(
      <Provider store={store}>
        <MemoryRouter>
          <PasswordReset loggedIn={false} {...props} />
        </MemoryRouter>
      </Provider>
    )
  })
})
