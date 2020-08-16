import React from "react"
import ReactDOM from "react-dom"
import App from "@/components/App"
import { TestProvider } from "@/testUtils"

describe("<App/>", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div")
    ReactDOM.render(
      <TestProvider>
        <App />
      </TestProvider>,
      div,
    )
  })
})
