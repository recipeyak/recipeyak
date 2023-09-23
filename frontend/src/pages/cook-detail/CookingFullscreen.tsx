import { useChannel } from "@ably-labs/react-hooks"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { Tab, Tabs } from "@/components/Tabs"
import { useTeamId } from "@/hooks"
import { IngredientViewContent } from "@/pages/recipe-detail/IngredientView"
import { Note } from "@/pages/recipe-detail/Notes"
import { RecipeSource } from "@/pages/recipe-detail/RecipeSource"
import { StepView } from "@/pages/recipe-detail/Step"
import { pathRecipeDetail } from "@/paths"
import { useCookChecklistFetch } from "@/queries/cookChecklistFetch"
import {
  updateChecklistItemCache,
  useCookChecklistUpdate,
} from "@/queries/cookChecklistUpdate"
import { IIngredient, INote, IStep } from "@/queries/recipeFetch"
import { notEmpty } from "@/text"
import { styled } from "@/theme"

type CheckmarkUpdated = {
  ingredientId: number
  checked: boolean
}

function useIngredients(recipeId: number) {
  const teamID = useTeamId()
  const queryClient = useQueryClient()

  useChannel(`cook_checklist:${teamID}:${recipeId}`, (message) => {
    switch (message.name) {
      case "checkmark_updated": {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        const res: CheckmarkUpdated = JSON.parse(message.data)
        updateChecklistItemCache(res, recipeId, queryClient)
        break
      }
    }
  })
  const {
    isLoading,
    isError,
    data: checkedIngredients,
    error,
  } = useCookChecklistFetch({ recipeId })
  const mutation = useCookChecklistUpdate({ recipeId })

  if (isError) {
    throw error
  }
  if (isLoading) {
    return { checkedIngredients, isLoading, mutation } as const
  }

  return { checkedIngredients, isLoading, mutation } as const
}

function Ingredients({
  ingredients,
  recipeId,
}: {
  ingredients: readonly IIngredient[]
  recipeId: number
}) {
  const { checkedIngredients, isLoading, mutation } = useIngredients(recipeId)

  if (isLoading) {
    return null
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {ingredients.map((i) => {
        const isDone = checkedIngredients[i.id]
        return (
          <div
            key={i.id}
            style={{ fontSize: "18px" }}
            className="d-flex align-items-start"
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
              style={{ marginTop: "0.5rem" }}
            />
            <label
              htmlFor={`ingredient-${i.id}`}
              className="selectable"
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
function Steps({ steps }: { steps: readonly IStep[] }) {
  const [selectedStep, setSelectedStep] = useState<number | undefined>()
  return (
    <div
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
            style={{
              fontSize: "18px",
              gap: "0.125rem",
              fontWeight: isSelected ? "500" : undefined,
              paddingBottom: "1rem",
            }}
            className="d-flex flex-direction-column"
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: isSelected ? "bold" : "500",
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
  notes: readonly INote[]
  recipeId: number
}) {
  if (notes.length === 0) {
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

const Container = styled.div`
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
  position: fixed;
  z-index: 20;
  inset: 0;
`

export function CookingFullscreen({
  recipeName,
  recipeId,
  recipeSource,
  ingredients,
  steps,
  notes,
}: {
  readonly recipeId: number
  readonly recipeName: string
  readonly recipeSource: string | null
  readonly ingredients: readonly IIngredient[]
  readonly steps: readonly IStep[]
  readonly notes: readonly INote[]
}) {
  const [tab, setTab] = useState<"ingredients" | "steps" | "notes">(
    "ingredients",
  )
  return (
    <Container>
      <div
        style={{
          padding: "0.5rem 1.25rem",
          overflow: "auto",
          height: "100%",
        }}
      >
        <Button
          to={pathRecipeDetail({ recipeId: recipeId.toString() })}
          variant="link"
          className="mb-2"
          style={{ fontSize: "0.875rem" }}
        >
          ← Return to Recipe
        </Button>

        <Box
          gap={2}
          dir="col"
          style={{
            fontSize: "18px",
            maxWidth: 600,
            minWidth: "min(600px, 100%)",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <div
            className="selectable"
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
              <Ingredients ingredients={ingredients} recipeId={recipeId} />
            ) : tab === "steps" ? (
              <Steps steps={steps} />
            ) : tab === "notes" ? (
              <Notes notes={notes} recipeId={recipeId} />
            ) : null}
          </div>
          {notEmpty(recipeSource) && (
            <div style={{ fontSize: "14px", display: "flex", gap: "0.25rem" }}>
              <div>from</div>
              <RecipeSource source={recipeSource} />
            </div>
          )}
        </Box>
      </div>
    </Container>
  )
}
