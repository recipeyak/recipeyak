import React from "react"

import { mount } from "enzyme"

import { MemoryRouter } from "react-router"

import ListItem from "./ListItem"

describe("<ListItem/>", () => {
  it("renders without crashing", () => {
    mount(
      <MemoryRouter>
        <ListItem id={0} delete={jest.fn()} update={jest.fn()} />
      </MemoryRouter>
    )
  })
})
