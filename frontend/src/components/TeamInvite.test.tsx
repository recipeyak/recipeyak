import React from "react"
import { MemoryRouter, match } from "react-router"
import { Provider } from "react-redux"
import { mount } from "enzyme"

import { emptyStore as store } from "@/store/store"

import TeamInvite from "@/components/TeamInvite"

describe("<TeamInvite/>", () => {
  it("renders without crashing", () => {
    // fake react router props
    const fakeMatch = {
      params: {
        id: "1"
      },
      isExact: false,
      path: "",
      url: ""
    } as match<{ id: string }>
    mount(
      <Provider store={store}>
        <MemoryRouter>
          <TeamInvite
            match={fakeMatch}
            id={123}
            fetchData={jest.fn()}
            name="hello"
            error404
            sendInvites={jest.fn()}
            // tslint:disable:no-any no-unsafe-any
            history={{} as any}
            location={{} as any}
            // tslint:enable:no-any no-unsafe-any
          />
        </MemoryRouter>
      </Provider>
    )
  })
})
