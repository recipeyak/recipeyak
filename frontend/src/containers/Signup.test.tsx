import React from "react"
import { mount } from "enzyme"
import Signup from "@/containers/Signup"
import { TestProvider } from "@/testUtils"

describe("<Signup/>", () => {
  it("renders signup", () => {
    const element = mount(
      <TestProvider>
        <Signup />
      </TestProvider>,
    )
    expect(element.text()).toContain("Email")
    expect(element.text()).toContain("Password")
    expect(element.text()).toContain("Password Again")
  })
})
