import React from "react"
import { MemoryRouter } from "react-router"
import { Provider } from "react-redux"

import { mount, configure } from "enzyme"
import Adapter from "enzyme-adapter-react-16"

import { emptyStore as store } from "../store/store"
import Nav from "./Nav"

configure({ adapter: new Adapter() })

describe("<Nav/>", () => {
  it("renders without failure", () => {
    const props: GetComponentProps<Nav> = {
      fetchData: jest.fn(),
      logout: jest.fn(),
      toggleDarkMode: jest.fn(),
      avatarURL: "example.com/avatar.png",
      email: "j.doe@example.com",
      loggingOut: false,
      darkMode: false,
      scheduleURL: "/schedule",
      teams: [],
      loadingTeams: false
    }
    mount(
      <Provider store={store}>
        <MemoryRouter>
          <Nav {...props} />
        </MemoryRouter>
      </Provider>
    )
  })
})
