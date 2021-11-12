import React from "react"
import { match as Match } from "react-router"
import { Location } from "history"
import { mount } from "enzyme"
import { history } from "@/store/store"
import { Recipe } from "@/components/Recipe"
import { TestProvider } from "@/testUtils"

describe("<Recipe/>", () => {
  const match: Match<{ id: string }> = {
    path: "/recipes/:id(\\d+)(.*)",
    url: "/recipes/98-apple-crisp",
    isExact: true,
    params: {
      id: "98",
    },
  }
  const location: Location = {
    pathname: "/recipes/98-apple-crisp",
    search: "?timeline=1",
    hash: "",
    key: "u3gfv7",
    state: null,
  }

  it("renders without failure", () => {
    mount(
      <TestProvider>
        <Recipe history={history} match={match} location={location} />
      </TestProvider>,
    )
  })
})
