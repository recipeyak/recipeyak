import React, { useEffect, useState } from "react"

import { useDispatch } from "@/hooks"
import AddIngredientForm from "@/pages/recipe-detail/AddIngredientForm"
import { AddSectionForm } from "@/pages/recipe-detail/AddSectionForm"
import { addIngredientToRecipe } from "@/store/reducers/recipes"

function AddIngredientSubForm({
  recipeId,
  loading,
  onCancel,

  onChangeSection,
  newPosition,
}: {
  readonly onCancel: () => void
  readonly recipeId: number
  readonly loading: boolean
  readonly onChangeSection: () => void
  readonly newPosition: string
}) {
  const dispatch = useDispatch()
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

  useEffect(() => {
    if (!loading) {
      setEmptyState()
    }
  }, [loading])

  const cancelAddIngredient = () => {
    onCancel()
    setEmptyState()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    switch (e.target.name) {
      case "quantity": {
        setQuantity(e.target.value)
        return
      }
      case "name": {
        setName(e.target.value)
        return
      }
      case "description": {
        setDescription(e.target.value)
        return
      }
      case "optional": {
        setOptional(e.target.value === "on")
        return
      }
    }
  }

  const handleAddIngredient = () =>
    dispatch(
      addIngredientToRecipe.request({
        recipeID: recipeId,
        ingredient: { quantity, name, description, position: newPosition },
      }),
    )

  return (
    <AddIngredientForm
      handleAddIngredient={handleAddIngredient}
      loading={loading}
      cancelAddIngredient={cancelAddIngredient}
      handleInputChange={handleInputChange}
      quantity={quantity}
      name={name}
      description={description}
      optional={optional}
      toggleShowAddSection={onChangeSection}
    />
  )
}

export default function AddIngredient({
  recipeId,
  addingIngredient,
  onCancel,
  newPosition,
}: {
  readonly onCancel: () => void
  readonly recipeId: number
  readonly addingIngredient: boolean
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
    <AddIngredientSubForm
      recipeId={recipeId}
      loading={addingIngredient}
      onCancel={onCancel}
      onChangeSection={toggleShowAddSection}
      newPosition={newPosition}
    />
  )
}
