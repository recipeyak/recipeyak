import React from "react"
import { MemoryRouter } from "react-router"
import { Provider } from "react-redux"
import { mount } from "enzyme"

import { emptyStore as store } from "../store/store"

import OAuth from "./OAuth"

describe("<OAuth/>", () => {
  it("renders without crashing", () => {
    mount(
      <Provider store={store}>
        <MemoryRouter>
          <OAuth service="gitlab" token="12345" login={jest.fn()} />
        </MemoryRouter>
      </Provider>
    )
  })
})
