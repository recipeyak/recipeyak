import React from "react"
import { mount, configure } from "enzyme"
import Adapter from "enzyme-adapter-react-16"

import RecipeItem from "./RecipeItem.jsx"
import { DndTestContext } from "../testUtils"

configure({ adapter: new Adapter() })

describe("RecipeItem", () => {
  it("renders without crashing", () => {
    const recipe = {
      id: 123,
      title: "Some recipe title",
      author: "Recipe author",
      url: "/someurl",
      source: "http://example.com/recipeTitle"
    }
    mount(
      <DndTestContext>
        <RecipeItem {...recipe} />
      </DndTestContext>
    )
  })
})
