import React from "react"
import { MemoryRouter } from "react-router"
import { Provider } from "react-redux"

import { mount } from "enzyme"

import { emptyStore as store } from "@/store/store"

import Recipe from "@/components/Recipe"

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
          id: "1"
        },
        isExact: false,
        path: "",
        url: "",
        id: ""
      },
      fetchRecipe: () => true
    }
    mount(
      <Provider store={store}>
        <MemoryRouter>
          // tslint:disable:no-any
          <Recipe {...props} location={{} as any} history={{} as any} />
          // tslint:enable:no-any
        </MemoryRouter>
      </Provider>
    )
  })
})
