import React from "react"
import { MemoryRouter, Route } from "react-router"
import { Provider } from "react-redux"

import { mount, configure } from "enzyme"
import Adapter from "enzyme-adapter-react-16"

import Signup from "./Signup.jsx"

import { emptyStore as store } from "../store/store"

configure({ adapter: new Adapter() })

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
