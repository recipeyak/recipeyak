import React from "react"
import { MemoryRouter, Route } from "react-router"
import { Provider } from "react-redux"

import { mount } from "enzyme"

import Signup from "./Signup"

import { emptyStore as store } from "store/store"

describe("<Signup/>", () => {
  it("renders signup", () => {
    const element = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/signup"]} initialIndex={1}>
          <Route path="/signup" component={Signup} />
        </MemoryRouter>
      </Provider>
    )
    expect(element.text()).toContain("Email")
    expect(element.text()).toContain("Password")
    expect(element.text()).toContain("Password Again")
  })
})
