import { toQuantity } from "@/components/ShoppingList"
import { IQuantity, Unit } from "@/api"

describe("shoppinglist", () => {
  test("#toQuantity", () => {
    const testCases: ReadonlyArray<[IQuantity, string]> = [
      [{ quantity: "1", unit: Unit.CUP }, "1 cup"],
      [{ quantity: "1", unit: Unit.SOME }, "some"],
      [{ quantity: "1", unit: Unit.UNKNOWN }, "1"],
      [{ quantity: "1", unit: Unit.UNKNOWN, unknown_unit: "bag" }, "1 bag"],
      [{ quantity: "1", unit: Unit.NONE }, "1"]
    ]

    testCases.forEach(([quantity, expected]) => {
      expect(toQuantity(quantity)).toEqual(expected)
    })
  })
})
