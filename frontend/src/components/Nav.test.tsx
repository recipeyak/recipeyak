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
    mount(
      <Provider store={store}>
        <MemoryRouter>
          <Nav
            avatarURL="foo"
            email="foo@foo.com"
            scheduleURL=""
            loadingTeams
            darkMode
            loggingOut
            teams={[]}
            logout={() => undefined}
            toggleDarkMode={() => undefined}
            fetchData={() => undefined}
          />
        </MemoryRouter>
      </Provider>
    )
  })
})
