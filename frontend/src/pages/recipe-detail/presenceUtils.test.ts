import { uniqPresense } from "@/pages/recipe-detail/presenceUtils"

test("uniqPresense", () => {
  expect(
    uniqPresense([
      { clientId: "hello", data: {} },
      { clientId: "abc", data: { active: false } },
      { clientId: "1231", data: { active: false } },
      { clientId: "abc", data: { active: undefined } },
      { clientId: "1231", data: { active: true } },
      { clientId: "1231", data: { active: undefined } },
      { clientId: "abc", data: { active: true } },
    ]),
  ).toEqual([
    { clientId: "1231", data: { active: true } },
    { clientId: "abc", data: { active: true } },
    { clientId: "hello", data: {} },
  ])
})
