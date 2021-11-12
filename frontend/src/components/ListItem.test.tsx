import React from "react"
import { mount } from "enzyme"
import renderer from "react-test-renderer"
import { MemoryRouter } from "react-router"
import ListItem from "@/components/ListItem"

describe("<ListItem/>", () => {
  it("renders without crashing", () => {
    mount(
      <MemoryRouter>
        <ListItem id={0} delete={jest.fn()} update={jest.fn()} />
      </MemoryRouter>,
    )
  })
})
