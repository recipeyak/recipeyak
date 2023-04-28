import { parseQuery } from "@/query-parser"

describe("parseQuery", () => {
  test("simple", () => {
    expect(parseQuery("tag:chris")).toEqual([{ field: "tag", value: "chris" }])
  })
  test("simple", () => {
    expect(parseQuery("tag:chris")).toEqual([{ field: "tag", value: "chris" }])
  })
  test("capital", () => {
    expect(parseQuery("Tag:chris")).toEqual([{ field: "tag", value: "chris" }])
  })
  test("single quotes", () => {
    expect(parseQuery("name:'mark bittman'")).toEqual([
      { field: "name", value: "mark bittman", quoted: true },
    ])
  })
  test("double quotes", () => {
    expect(parseQuery(`name:"mark bittman"`)).toEqual([
      { field: "name", value: "mark bittman", quoted: true },
    ])
  })
  test("negative", () => {
    expect(parseQuery("-tag:chris")).toEqual([
      { field: "tag", value: "chris", negative: true },
    ])
  })
  test("escape single quote", () => {
    expect(parseQuery(`-tag:'chri\\'s'`)).toEqual([
      { field: "tag", value: "chri's", quoted: true, negative: true },
    ])
  })
  test("escape double quote", () => {
    expect(parseQuery(`-tag:"chri\\"\\"s"`)).toEqual([
      { field: "tag", value: `chri""s`, quoted: true, negative: true },
    ])
  })
  test("complex", () => {
    expect(
      parseQuery(
        `  tag:chris hello -tag:dessert   name:pie   author:"Christopher Dignam" testing abc "multi word" `,
      ),
    ).toEqual([
      { field: "tag", value: "chris" },
      { field: null, value: "hello" },
      { field: "tag", value: "dessert", negative: true },
      { field: "name", value: "pie" },
      { field: "author", value: "Christopher Dignam", quoted: true },
      { field: null, value: "testing" },
      { field: null, value: "abc" },
      { field: null, value: "multi word", quoted: true },
    ])
  })
})
