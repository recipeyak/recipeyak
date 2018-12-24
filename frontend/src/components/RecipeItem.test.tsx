import React from "react"
import { mount } from "enzyme"

import RecipeItem from "./RecipeItem"
import { DndTestContext } from "../testUtils"

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
