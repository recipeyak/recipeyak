import React from "react"
import { MemoryRouter } from "react-router"
import { Provider } from "react-redux"

import { mount } from "enzyme"

import { emptyStore as store } from "store/store"

import Recipe from "./Recipe"

describe("<Recipe/>", () => {
  it("renders without failure", () => {
    const props = {
      ingredients: [],
      steps: [],
      name: "",
      author: "",
      source: "",
      time: "",
      // a bodge to mock out `this.props.match.params.id`
      match: {
        params: {
          id: 1
        }
      },
      fetchRecipe: () => true
    }
    mount(
      <Provider store={store}>
        <MemoryRouter>
          <Recipe {...props} />
        </MemoryRouter>
      </Provider>
    )
  })
})
