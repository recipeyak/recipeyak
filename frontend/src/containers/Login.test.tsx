import React from "react"
import { mount } from "enzyme"
import Login from "@/containers/Login"
import { TestProvider } from "@/testUtils"
import { Location } from "history"

describe("<Login/>", () => {
  it("renders login", () => {
    const location: Location = {
      pathname: "/login",
      search: "",
      hash: "",
      key: "",
      state: null
    }
    const element = mount(
      <TestProvider>
        <Login location={location} />
      </TestProvider>
    )
    expect(element.text()).toContain("Email")
    expect(element.text()).toContain("Password")
  })
})
