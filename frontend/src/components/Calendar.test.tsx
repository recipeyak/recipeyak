import React from "react"
import renderer from "react-test-renderer"
import { TestProvider, mockDate } from "@/testUtils"
import { Calendar } from "@/components/Calendar"

describe("<Calendar> Snap", () => {
  beforeAll(() => {
    const dateStr = "1776-1-1"
    mockDate.set(dateStr)
    jest.spyOn(Date.prototype, "toString").mockImplementation(() => dateStr)
  })
  afterAll(() => {
    mockDate.reset()
    jest.restoreAllMocks()
  })
  test("smoke test render with empty data", () => {
    const tree = renderer
      .create(
        <TestProvider>
          <Calendar teamID={10} type="recipes" />
        </TestProvider>
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
