import { inputAbs } from "@/input"

describe("inputAbs", () => {
  it("strips non-digit chars", () => {
    const input = "-123"

    expect(inputAbs(input)).toEqual(123)
  })

  it("remove leading zeros", () => {
    const input = "000123"

    expect(inputAbs(input)).toEqual(123)
  })

  it("removes infix text", () => {
    const input = "1-23"

    expect(inputAbs(input)).toEqual(123)
  })

  it("defaults to 0 when error", () => {
    const input = "-asdf"

    expect(inputAbs(input)).toEqual(0)
  })
})
