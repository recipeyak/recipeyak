import React from "react"
import { match } from "react-router"
import { mount } from "enzyme"
import TeamInvite from "@/components/TeamInvite"
import { TestProvider } from "@/testUtils"

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
      <TestProvider>
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
      </TestProvider>
    )
  })
})
