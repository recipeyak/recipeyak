import React from "react"
import { MemoryRouter } from "react-router"
import { Provider } from "react-redux"

import { mount } from "enzyme"

import { emptyStore as store } from "store/store"
import Nav from "./Nav"

describe("<Nav/>", () => {
  it("renders without failure", () => {
    mount(
      <Provider store={store}>
        <MemoryRouter>
          <Nav
            avatarURL="foo"
            email="foo@foo.com"
            loadingTeams
            darkMode
            loggingOut
            teams={[]}
            logout={() => undefined}
            toggleDarkMode={() => undefined}
            fetchData={() => undefined}
            teamID={0}
            scheduleURL={"/schedule"}
          />
        </MemoryRouter>
      </Provider>
    )
  })
})
