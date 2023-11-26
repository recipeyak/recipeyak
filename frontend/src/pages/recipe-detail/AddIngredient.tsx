import React, { useState } from "react"

import { Button } from "@/components/Buttons"
import { FormControl } from "@/components/FormControl"
import { FormField } from "@/components/FormField"
import { CheckBox, TextInput } from "@/components/Forms"
import { AddSectionForm } from "@/pages/recipe-detail/AddSectionForm"
import { useIngredientCreate } from "@/queries/ingredientCreate"

function AddIngredientForm({
  recipeId,
  onCancel,
  onChangeSection,
  newPosition,
}: {
  readonly onCancel: () => void
  readonly recipeId: number
  readonly onChangeSection: () => void
  readonly newPosition: string
}) {
  const [quantity, setQuantity] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [optional, setOptional] = useState(false)

  const setEmptyState = () => {
    setQuantity("")
    setName("")
    setDescription("")
    setOptional(false)
  }

  const cancelAddIngredient = () => {
    onCancel()
    setEmptyState()
  }

  const createIngredient = useIngredientCreate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createIngredient.mutate(
      {
        recipeId,
        payload: {
          quantity,
          name,
          description,
          position: newPosition,
          optional,
        },
      },
      {
        onSuccess: () => {
          setEmptyState()
          focusFirstInput()
        },
      },
    )
  }

  const addDisabled = quantity === "" && name === ""

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-2 flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <TextInput
            id="firstinput"
            onChange={(e) => {
              setQuantity(e.target.value)
            }}
            value={quantity}
            error={createIngredient.isError}
            placeholder="3 lbs"
            className="!w-2/3"
          />
          <TextInput
            onChange={(e) => {
              setName(e.target.value)
            }}
            value={name}
            error={createIngredient.isError}
            placeholder="tomato"
            className="!w-2/3"
          />
        </div>
        <div>
          <TextInput
            onChange={(e) => {
              setDescription(e.target.value)
            }}
            value={description}
            error={createIngredient.isError}
            placeholder="diced at 3cm"
          />
          {createIngredient.isError ? (
            <p className="text-base text-[var(--color-danger)]">
              A recipe needs at least one ingredient
            </p>
          ) : null}
        </div>
      </div>

      <label className="mb-2 flex cursor-pointer items-center">
        <CheckBox
          onChange={() => {
            setOptional((prev) => !prev)
          }}
          checked={optional}
          className="mr-2"
        />
        Optional
      </label>
      <FormField isGrouped>
        <div className="grow">
          <Button size="small" type="button" onClick={onChangeSection}>
            Add Section
          </Button>
        </div>
        <FormControl>
          <Button onClick={cancelAddIngredient} size="small" type="button">
            Cancel
          </Button>
        </FormControl>
        <FormControl>
          <Button
            variant="primary"
            disabled={addDisabled}
            size="small"
            type="submit"
            loading={createIngredient.isPending}
          >
            Add
          </Button>
        </FormControl>
      </FormField>
    </form>
  )
}

export default function AddIngredient({
  recipeId,
  onCancel,
  newPosition,
}: {
  readonly onCancel: () => void
  readonly recipeId: number
  readonly newPosition: string
}) {
  const [showAddSection, setShowAddSection] = React.useState(false)
  const toggleShowAddSection = () => {
    setShowAddSection((p) => !p)
  }

  if (showAddSection) {
    return (
      <AddSectionForm
        recipeId={recipeId}
        toggleShowAddSection={toggleShowAddSection}
        onCancel={onCancel}
        newPosition={newPosition}
      />
    )
  }
  return (
    <AddIngredientForm
      recipeId={recipeId}
      onCancel={onCancel}
      onChangeSection={toggleShowAddSection}
      newPosition={newPosition}
    />
  )
}

function focusFirstInput() {
  const el = document.getElementById("firstinput")
  el?.focus()
}
