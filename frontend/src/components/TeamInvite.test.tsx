import React from "react"
import { match } from "react-router"
import { mount } from "enzyme"
import TeamInvite from "@/components/TeamInvite"
import { TestProvider } from "@/testUtils"

describe("<TeamInvite/>", () => {
  it("renders without crashing", () => {
    // fake react router props
    const fakeMatch: match<{ id: string }> = {
      params: {
        id: "1",
      },
      isExact: false,
      path: "",
      url: "",
    }
    mount(
      <TestProvider>
        <TeamInvite
          match={fakeMatch}
          id={123}
          fetchData={jest.fn()}
          name="hello"
          error404
          sendInvites={jest.fn()}
          /* eslint-disable @typescript-eslint/consistent-type-assertions */
          // tslint:disable:no-any no-unsafe-any
          history={{} as any}
          location={{} as any}
          // tslint:enable:no-any no-unsafe-any
          /* eslint-enable @typescript-eslint/consistent-type-assertions */
        />
      </TestProvider>,
    )
  })
})
