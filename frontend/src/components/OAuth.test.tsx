import React from "react"
import { mount } from "enzyme"
import OAuth from "@/components/OAuth"
import { TestProvider } from "@/testUtils"

describe("<OAuth/>", () => {
  it("renders without crashing", () => {
    mount(
      <TestProvider>
        <OAuth service="gitlab" token="12345" login={jest.fn()} />
      </TestProvider>,
    )
  })
})
