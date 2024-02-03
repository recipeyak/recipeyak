import { sortBy } from "lodash-es"

import { RecipeFetchResponse as Recipe } from "@/queries/recipeFetch"

type Ingredient = Recipe["ingredients"][number]

export type SectionsAndIngredients = ReadonlyArray<
  | {
      readonly kind: "ingredient"
      readonly item: Ingredient
    }
  | {
      readonly kind: "section"
      readonly item: {
        readonly id: number
        readonly title: string
        readonly position: string
      }
    }
>
// from https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#improved-control-over-mapped-type-modifiers
export type Mutable<T> = { -readonly [P in keyof T]-?: T[P] }

export function getInitialIngredients({
  sections,
  ingredients,
}: {
  sections: ReadonlyArray<Recipe["sections"][number]>
  ingredients: ReadonlyArray<Recipe["ingredients"][number]>
}): SectionsAndIngredients {
  const out: Mutable<SectionsAndIngredients> = []
  for (const s of sections) {
    out.push({
      kind: "section" as const,
      item: s,
    })
  }
  for (const i of ingredients) {
    out.push({
      kind: "ingredient" as const,
      item: i,
    })
  }
  return sortBy(out, (x) => x.item.position)
}
