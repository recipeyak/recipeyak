import * as React from "react"

import { mount } from "enzyme"

import { Provider } from "react-redux"
import { MemoryRouter } from "react-router"

import { emptyStore as store } from "store/store"
import AddRecipe from "./AddRecipe"

describe("<AddRecipe/>", () => {
  it("renders without crashing", () => {
    mount(
      <Provider store={store}>
        <MemoryRouter>
          <AddRecipe
            clearErrors={jest.fn()}
            addStep={jest.fn()}
            clearForm={jest.fn()}
            setTime={jest.fn()}
            setServings={jest.fn()}
            setSource={jest.fn()}
            setAuthor={jest.fn()}
            setName={jest.fn()}
            removeStep={jest.fn()}
            updateStep={jest.fn()}
            fetchData={jest.fn()}
            addRecipe={jest.fn()}
            removeIngredient={jest.fn()}
            updateIngredient={jest.fn()}
            addIngredient={jest.fn()}
            setTeamID={jest.fn()}
            error={{
              errorWithName: false,
              errorWithIngredients: false,
              errorWithSteps: false
            }}
            loading={false}
            name={""}
            author={""}
            source={""}
            time={""}
            servings={""}
            ingredients={[]}
            steps={[]}
            loadingTeams={false}
            teams={[]}
            teamID={0}
          />
        </MemoryRouter>
      </Provider>
    )
  })
})
