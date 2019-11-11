import React from "react"
import { Navbar } from "@/components/Nav"
import { TestProvider } from "@/testUtils"
import renderer from "react-test-renderer"

describe("<Nav/>", () => {
  it("renders without failure", () => {
    const tree = renderer.create(
      <TestProvider>
        <Navbar />
      </TestProvider>
    )
    expect(tree).toMatchSnapshot()
  })
})
