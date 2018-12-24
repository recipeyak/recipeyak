import * as React from "react"

import { mount, configure } from "enzyme"
import Adapter from "enzyme-adapter-react-16"

import { Provider } from "react-redux"
import { MemoryRouter } from "react-router"

import { emptyStore as store } from "../store/store"
import AddRecipe from "./AddRecipe"

configure({ adapter: new Adapter() })

describe("<AddRecipe/>", () => {
  it("renders without crashing", () => {
    mount(
      <Provider store={store}>
        <MemoryRouter>
          <AddRecipe
            clearErrors={() => undefined}
            addStep={() => undefined}
            clearForm={() => undefined}
            setTime={() => undefined}
            setServings={() => undefined}
            setSource={() => undefined}
            setAuthor={() => undefined}
            setName={() => undefined}
            removeStep={() => undefined}
            updateStep={() => undefined}
            fetchData={() => undefined}
            addRecipe={() => undefined}
            removeIngredient={() => undefined}
            updateIngredient={() => undefined}
            addIngredient={() => undefined}
            setTeamID={() => undefined}
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
