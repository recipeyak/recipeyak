import React from "react"
import { mount } from "enzyme"
import Team from "@/components/Team"
import { TestProvider } from "@/testUtils"

describe("<Team/>", () => {
  it("renders without crashing", () => {
    mount(
      <TestProvider>
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
      </TestProvider>
    )
  })
})
