import React, { useState } from "react"

import { Button } from "@/components/Buttons"
import { CheckBox } from "@/components/Checkbox"
import { TextInput } from "@/components/TextInput"
import { AddSectionForm } from "@/pages/recipe-detail/AddSectionForm"
import { useIngredientCreate } from "@/queries/useIngredientCreate"

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
            autoCapitalize="none"
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
            autoCapitalize="none"
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
            autoCapitalize="none"
            onChange={(e) => {
              setDescription(e.target.value)
            }}
            value={description}
            error={createIngredient.isError}
            placeholder="diced at 3cm"
          />
          {createIngredient.isError ? (
            // eslint-disable-next-line react/forbid-elements
            <p className="text-base text-[--color-danger]">
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
      <div className="flex justify-between">
        <Button size="small" type="button" onClick={onChangeSection}>
          Switch to Section
        </Button>
        <div className="flex gap-2">
          <Button onClick={cancelAddIngredient} size="small" type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={addDisabled}
            size="small"
            type="submit"
            aria-label="add ingredient"
            loading={createIngredient.isPending}
          >
            Add Ingredient
          </Button>
        </div>
      </div>
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
