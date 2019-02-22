import React from "react"
import { mount } from "enzyme"

import RecipeItem from "@/components/RecipeItem"
import { DndTestContext } from "@/testUtils"

describe("RecipeItem", () => {
  it("renders without crashing", () => {
    mount(
      <DndTestContext>
        <RecipeItem
          id={123}
          author="some recipe title"
          url="/someurl"
          name="foo"
          drag
        />
      </DndTestContext>
    )
  })
})
