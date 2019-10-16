import React from "react"
import { mount } from "enzyme"
import Nav from "@/components/Nav"
import { TestProvider } from "@/testUtils"

describe("<Nav/>", () => {
  it("renders without failure", () => {
    mount(
      <TestProvider>
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
      </TestProvider>
    )
  })
})
