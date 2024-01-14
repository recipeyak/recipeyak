import { useState } from "react"

import { Box } from "@/components/Box"
import { Link } from "@/components/Routing"
import { Tab, Tabs } from "@/components/Tabs"
import { getInitialIngredients } from "@/ingredients"
import { IngredientViewContent } from "@/pages/recipe-detail/IngredientView"
import { Note } from "@/pages/recipe-detail/Notes"
import { RecipeSource } from "@/pages/recipe-detail/RecipeSource"
import { StepView } from "@/pages/recipe-detail/Step"
import { useCookChecklistFetch } from "@/queries/cookChecklistFetch"
import { useCookChecklistUpdate } from "@/queries/cookChecklistUpdate"
import { PickVariant } from "@/queries/queryUtilTypes"
import { RecipeFetchResponse as Recipe } from "@/queries/recipeFetch"
import { notEmpty } from "@/text"
import { recipeURL } from "@/urls"

type Ingredient = Recipe["ingredients"][number]
type Step = Recipe["steps"][number]
type Note = PickVariant<Recipe["timelineItems"][number], "note">

function useIngredients(recipeId: number) {
  const {
    isPending,
    isError,
    data: checkedIngredients,
    error,
  } = useCookChecklistFetch({ recipeId })
  const mutation = useCookChecklistUpdate({ recipeId })

  if (isError) {
    throw error
  }
  if (isPending) {
    return { checkedIngredients, isPending, mutation } as const
  }

  return { checkedIngredients, isPending, mutation } as const
}

function Ingredients({
  ingredients,
  recipeId,
  sections,
}: {
  ingredients: readonly Ingredient[]
  recipeId: number
  readonly sections: readonly {
    readonly id: number
    readonly title: string
    readonly position: string
  }[]
}) {
  const { checkedIngredients, isPending, mutation } = useIngredients(recipeId)

  if (isPending) {
    return null
  }

  const combined = getInitialIngredients({ sections, ingredients })

  return (
    <div
      // eslint-disable-next-line no-restricted-syntax
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {combined.map((ingredientOrSection) => {
        if (ingredientOrSection.kind === "section") {
          return (
            <div
              key={`section-${ingredientOrSection.item.id}`}
              className="text-sm font-bold"
            >
              {ingredientOrSection.item.title}
            </div>
          )
        }
        const i = ingredientOrSection.item
        const isDone = checkedIngredients[i.id]
        return (
          <div
            key={`ingredient-${i.id}`}
            // eslint-disable-next-line no-restricted-syntax
            style={{ fontSize: "18px" }}
            className="flex items-start"
          >
            <input
              id={`ingredient-${i.id}`}
              type="checkbox"
              checked={isDone}
              onChange={(e) => {
                mutation.mutate({
                  checked: e.target.checked,
                  ingredientId: i.id,
                })
              }}
              // eslint-disable-next-line no-restricted-syntax
              style={{ marginTop: "0.5rem" }}
            />
            <label
              htmlFor={`ingredient-${i.id}`}
              className="cursor-auto select-text"
              // eslint-disable-next-line no-restricted-syntax
              style={{
                paddingLeft: "0.5rem",
                paddingBottom: "0.5rem",
                width: "100%",
                textDecoration: isDone ? "line-through" : undefined,
              }}
            >
              <IngredientViewContent
                quantity={i.quantity}
                description={i.description}
                name={i.name}
                optional={i.optional}
              />
            </label>
          </div>
        )
      })}
    </div>
  )
}
function Steps({ steps }: { steps: readonly Step[] }) {
  const [selectedStep, setSelectedStep] = useState<number | undefined>()
  return (
    <div
      // eslint-disable-next-line no-restricted-syntax
      style={{
        display: "flex",
        flexDirection: "column",
        lineHeight: "1.4",
        maxWidth: 600,
      }}
    >
      {steps.map((i, idx) => {
        const isSelected = i.id === selectedStep
        return (
          <div
            key={i.id}
            onClick={() => {
              setSelectedStep(i.id)
            }}
            // eslint-disable-next-line no-restricted-syntax
            style={{
              fontSize: "18px",
              gap: "0.125rem",
              fontWeight: isSelected ? "500" : undefined,
              paddingBottom: "1rem",
            }}
            className="flex flex-col"
          >
            <div
              // eslint-disable-next-line no-restricted-syntax
              style={{
                fontSize: "14px",
                fontWeight: isSelected ? "font-bold" : "500",
                textDecoration: isSelected ? "underline" : undefined,
                textUnderlineOffset: "0.25rem",
              }}
            >
              Step {idx + 1}
            </div>
            <StepView text={i.text} />
          </div>
        )
      })}
    </div>
  )
}
function Notes({
  notes,
  recipeId,
}: {
  notes: readonly Note[]
  recipeId: number
}) {
  if (notes.length === 0) {
    // eslint-disable-next-line no-restricted-syntax
    return <div style={{ fontSize: "16px" }}>no notes</div>
  }
  return (
    <div>
      {notes.map((note) => (
        <Note
          key={note.id}
          note={note}
          recipeId={recipeId}
          openImage={() => {}}
        />
      ))}
    </div>
  )
}

export function CookingFullscreen({
  recipeName,
  recipeId,
  recipeSource,
  ingredients,
  sections,
  steps,
  notes,
}: {
  readonly recipeId: number
  readonly recipeName: string
  readonly recipeSource: string | null
  readonly ingredients: readonly Ingredient[]
  readonly sections: readonly {
    readonly id: number
    readonly title: string
    readonly position: string
  }[]
  readonly steps: readonly Step[]
  readonly notes: readonly Note[]
}) {
  const [tab, setTab] = useState<"ingredients" | "steps" | "notes">(
    "ingredients",
  )
  return (
    <div className="fixed inset-0 z-20 items-center justify-center bg-[--color-background]">
      <div
        // eslint-disable-next-line no-restricted-syntax
        style={{
          padding: "0.5rem 1.25rem",
          overflow: "auto",
          height: "100%",
        }}
      >
        <Link
          to={recipeURL(recipeId, recipeName)}
          className="mb-2 px-1 py-2 text-sm"
        >
          ← Return to Recipe
        </Link>

        <Box
          gap={2}
          dir="col"
          // eslint-disable-next-line no-restricted-syntax
          style={{
            fontSize: "18px",
            maxWidth: 600,
            minWidth: "min(600px, 100%)",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <div
            className="cursor-auto select-text"
            // eslint-disable-next-line no-restricted-syntax
            style={{
              fontSize: "2rem",
              lineHeight: "1em",
              fontFamily: "Georgia,serif",
            }}
          >
            {recipeName}
          </div>
          <Tabs>
            <Tab
              isActive={tab === "ingredients"}
              onClick={() => {
                setTab("ingredients")
              }}
            >
              Ingredients
            </Tab>
            <Tab
              isActive={tab === "steps"}
              onClick={() => {
                setTab("steps")
              }}
            >
              Steps
            </Tab>
            <Tab
              isActive={tab === "notes"}
              onClick={() => {
                setTab("notes")
              }}
            >
              Notes
            </Tab>
          </Tabs>
          <div>
            {tab === "ingredients" ? (
              <Ingredients
                ingredients={ingredients}
                sections={sections}
                recipeId={recipeId}
              />
            ) : tab === "steps" ? (
              <Steps steps={steps} />
            ) : tab === "notes" ? (
              <Notes notes={notes} recipeId={recipeId} />
            ) : null}
          </div>
          {notEmpty(recipeSource) && (
            // eslint-disable-next-line no-restricted-syntax
            <div style={{ fontSize: "14px", display: "flex", gap: "0.25rem" }}>
              <div>from</div>
              <RecipeSource source={recipeSource} />
            </div>
          )}
        </Box>
      </div>
    </div>
  )
}
