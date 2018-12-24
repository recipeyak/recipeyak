import React from "react"
import { mount, configure } from "enzyme"
import Adapter from "enzyme-adapter-react-16"

import RecipeItem from "./RecipeItem"
import { DndTestContext } from "../testUtils"

configure({ adapter: new Adapter() })

describe("RecipeItem", () => {
  it("renders without crashing", () => {
    mount(
      <DndTestContext>
        <RecipeItem
          id={123}
          author="some recipe title"
          url="/someurl"
          name="foo"
          teamID={1}
          owner={{
            type: "user",
            id: 1
          }}
          drag
        />
      </DndTestContext>
    )
  })
})
