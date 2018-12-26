import React from "react"
import { MemoryRouter } from "react-router"
import { Provider } from "react-redux"
import { mount } from "enzyme"

import { emptyStore as store } from "@/store/store"

import Team from "@/components/Team"

describe("<Team/>", () => {
  it("renders without crashing", () => {
    mount(
      <Provider store={store}>
        <MemoryRouter>
          <Team
            id={1}
            deleteTeam={(_id: number) => Promise.resolve()}
            fetchData={(x: number) => x}
            error404={false}
            loadingTeam={false}
            updatingTeam={(_id: number) => Promise.resolve()}
            isSettings={false}
            members={[]}
            recipes={[]}
            name="foo"
            loadingMembers={false}
            loadingRecipes={false}
          />
        </MemoryRouter>
      </Provider>
    )
  })
})
