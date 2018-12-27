import React from "react"
import { MemoryRouter, Route } from "react-router"
import { Provider } from "react-redux"

import { mount } from "enzyme"

import Login from "@/containers/Login"

import { emptyStore as store } from "@/store/store"

describe("<Login/>", () => {
  it("renders login", () => {
    const element = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/login"]} initialIndex={1}>
          <Route path="/login" component={Login} />
        </MemoryRouter>
      </Provider>
    )
    expect(element.text()).toContain("Email")
    expect(element.text()).toContain("Password")
  })
})
