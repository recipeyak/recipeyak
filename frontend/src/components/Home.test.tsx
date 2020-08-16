import * as React from "react"
import { mount } from "enzyme"
import Home from "@/components/Home"
import { TestProvider } from "@/testUtils"

describe("<Home/>", () => {
  it("renders without crashing", () => {
    mount(
      <TestProvider>
        <Home loggedIn={false} />
      </TestProvider>,
    )
  })
  it("Has some text in footer", () => {
    const home = mount(
      <TestProvider>
        <Home loggedIn={false} />
      </TestProvider>,
    )
    expect(
      home
        .find("a")
        .first()
        .text(),
    ).toContain("Create Account")
  })
})
