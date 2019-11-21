import { toURL } from "@/urls"

describe("#toURL", () => {
  it("replaces #", () => {
    expect(toURL("/recipes/12-####")).toEqual("recipes12")
  })
  it("replaces ?", () => {
    expect(toURL("/recipes/12-good?no!")).toEqual("recipes12-goodno")
  })
  it("removes quotes", () => {
    expect(toURL("J. Shmoe's")).toEqual("j-shmoes")
  })
  it("removes commas", () => {
    expect(toURL("Blueberry, Almond")).toEqual("blueberry-almond")
  })
  it("trim leading space", () => {
    expect(toURL("   foo")).toEqual("foo")
  })
  it("trim trailing space", () => {
    expect(toURL("bar    ")).toEqual("bar")
  })
  it("regression deburring", () => {
    expect(toURL("Classic Tiramisù")).toEqual("classic-tiramisu")
  })
})
