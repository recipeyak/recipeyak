import React from "react"
import { MemoryRouter } from "react-router"
import { mount } from "enzyme"
import NoMatch from "./NoMatch"

describe("<NoMatch/>", () => {
  it("renders without failure", () => {
    mount(
      <MemoryRouter>
        <NoMatch />
      </MemoryRouter>
    )
  })
})
