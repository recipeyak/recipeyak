import React from "react"

import { mount, configure } from "enzyme"
import Adapter from "enzyme-adapter-react-16"

import { MemoryRouter } from "react-router"

import ListItem from "./ListItem.jsx"

configure({ adapter: new Adapter() })

describe("<ListItem/>", () => {
  it("renders without crashing", () => {
    mount(
      <MemoryRouter>
        <ListItem />
      </MemoryRouter>
    )
  })
})
