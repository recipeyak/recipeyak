export type Recipe = {
  // @constraint{readonly}
  id: string
  // @constraint{readonly}
  object: "recipe"
  // @constraint{max_length=100}
  title: string
  // @constraint{max_length=100}
  author: string
  // @constraint{max_length=100}
  time: string
  // @constraint{max_length=100}
  servings: string
  // @constraint{max_length=100}
  source: string
  // @constraint{max_length=20}
  tags: string[]
  // @constraint{max_length=200}
  ingredients: (Ingredient | Section)[]
  // @constraint{max_length=200}
  steps: Step[]
  // @constraint{max_length=200}
  primaryPhoto: string
}

type Section = {
  // @constraint{readonly}
  id: string
  // @constraint{readonly}
  object: "section"
  title: string
  position: string
}

type Ingredient = {
  // @constraint{readonly}
  id: string
  // @constraint{readonly}
  object: "ingredient"
  position: string
  // @constraint{max_length=100}
  quantity: string
  // @constraint{max_length=100}
  name: string
  // @constraint{max_length=100}
  description: string
}

type Step = {
  // @constraint{readonly}
  id: string
  // @constraint{readonly}
  object: "step"
  position: string
  // @constraint{max_length=1000}
  text: string
}

export const recipe: Recipe = {
  id: "recipe_123",
  object: "recipe",
  title: "",
  author: "",
  time: "",
  servings: "",
  source: "",
  tags: [],
  primaryPhoto: "",
  ingredients: [
    {
      id: "ingre_123",
      object: "ingredient",
      position: "a",
      quantity: "",
      name: "",
      description: "",
    },
  ],
  steps: [
    {
      id: "step_123",
      object: "step",
      position: "a",
      text: "",
    },
  ],
}
