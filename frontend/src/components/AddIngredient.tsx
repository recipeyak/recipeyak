import React, { useState, useEffect } from "react"

import AddIngredientForm from "@/components/AddIngredientForm"
import { useDispatch } from "@/hooks"
import { addIngredientToRecipe } from "@/store/reducers/recipes"
import { AddSectionForm } from "@/components/AddSectionForm"

function AddIngredientSubForm({
  recipeId,
  loading,
  onCancel,
  autoFocus,
  onChangeSection,
}: {
  readonly onCancel: () => void
  readonly recipeId: number
  readonly loading: boolean
  readonly autoFocus: boolean
  readonly onChangeSection: () => void
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
      case "quantity":
        return setQuantity(e.target.value)
      case "name":
        return setName(e.target.value)
      case "description":
        return setDescription(e.target.value)
      case "optional":
        return setOptional(e.target.value === "on")
    }
  }

  const handleAddIngredient = () =>
    dispatch(
      addIngredientToRecipe.request({
        recipeID: recipeId,
        ingredient: { quantity, name, description },
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
      autoFocus={autoFocus}
      toggleShowAddSection={onChangeSection}
    />
  )
}

export default function AddIngredient({
  recipeId,
  addingIngredient,
  onCancel,
  autoFocus,
}: {
  readonly onCancel: () => void
  readonly recipeId: number
  readonly addingIngredient: boolean
  readonly autoFocus: boolean
}) {
  const [showAddSection, setShowAddSection] = React.useState(false)
  const toggleShowAddSection = () => setShowAddSection((p) => !p)

  if (showAddSection) {
    return (
      <AddSectionForm
        recipeId={recipeId}
        toggleShowAddSection={toggleShowAddSection}
        onCancel={onCancel}
      />
    )
  }
  return (
    <AddIngredientSubForm
      recipeId={recipeId}
      loading={addingIngredient}
      onCancel={onCancel}
      autoFocus={autoFocus}
      onChangeSection={toggleShowAddSection}
    />
  )
}
