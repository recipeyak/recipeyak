import React from "react"
import { mount } from "enzyme"
import renderer from "react-test-renderer"
import { MemoryRouter } from "react-router"
import ListItem from "@/components/ListItem"
import { TestProvider } from "@/testUtils"

describe("<ListItem/>", () => {
  it("renders without crashing", () => {
    mount(
      <MemoryRouter>
        <ListItem id={0} delete={jest.fn()} update={jest.fn()} />
      </MemoryRouter>
    )
  })

  test("snap with capitalization", () => {
    const testCases = [
      "Add 3 tablespoons of tomato paste. Cook 1 minute.",
      "Measure 1 teaspoon of rice vinegar.",
      "Add 1 tablespoon + 2 teaspoons of soy sauce.",
      "Stir in 1 Teaspoon salt"
    ]

    testCases.forEach(text => {
      const tree = renderer
        .create(
          <TestProvider>
            <ListItem
              id={0}
              delete={jest.fn()}
              update={jest.fn()}
              text={text}
            />
          </TestProvider>
        )
        .toJSON()

      expect(tree).toMatchSnapshot()
    })
  })
})
