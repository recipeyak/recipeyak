import React from "react"
import { MemoryRouter } from "react-router"
import { Provider } from "react-redux"
import { mount, configure } from "enzyme"
import Adapter from "enzyme-adapter-react-16"

import { emptyStore as store } from "../store/store"

import OAuth from "./OAuth.jsx"

configure({ adapter: new Adapter() })

describe("<OAuth/>", () => {
  it("renders without crashing", () => {
    const props = {
      service: "my-provider",
      token: "12345",
      login: (service, token) =>
        expect(service === props.service && token === props.token)
    }
    mount(
      <Provider store={store}>
        <MemoryRouter>
          <OAuth {...props} />
        </MemoryRouter>
      </Provider>
    )
  })
})
