import React from "react"
import { MemoryRouter } from "react-router"
import { Provider } from "react-redux"
import { mount } from "enzyme"

import { emptyStore as store } from "store/store"

import TeamInvite from "./TeamInvite"

describe("<TeamInvite/>", () => {
  it("renders without crashing", () => {
    // fake react router props
    const match = {
      params: {
        id: 1
      }
    }
    mount(
      <Provider store={store}>
        <MemoryRouter>
          <TeamInvite match={match} />
        </MemoryRouter>
      </Provider>
    )
  })
})
