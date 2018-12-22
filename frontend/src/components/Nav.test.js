import React from "react"
import { MemoryRouter } from "react-router"
import { Provider } from "react-redux"

import { mount, configure } from "enzyme"
import Adapter from "enzyme-adapter-react-16"

import { emptyStore as store } from "../store/store"
import Nav from "./Nav.jsx"

configure({ adapter: new Adapter() })

describe("<Nav/>", () => {
  it("renders without failure", () => {
    mount(
      <Provider store={store}>
        <MemoryRouter>
          <Nav fetchData={() => true} />
        </MemoryRouter>
      </Provider>
    )
  })
})
