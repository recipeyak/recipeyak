import React, { useState, useEffect } from "react"

import AddIngredientForm from "@/components/AddIngredientForm"
import { useDispatch } from "@/hooks"
import { addIngredientToRecipe } from "@/store/reducers/recipes"

export interface IIngredientBasic {
  quantity: string
  name: string
  description: string
}

interface IAddIngredientProps {
  readonly onCancel: () => void
  readonly id: number
  readonly loading: boolean
  readonly autoFocus: boolean
}

interface IAddIngredientState {
  readonly quantity: string
  readonly name: string
  readonly description: string
  readonly optional: boolean
  readonly addingIngredient: boolean
}

export type AddIngredientFields = Exclude<
  keyof IAddIngredientState,
  "addingIngredient"
>

export default function AddIngredient({
  id,
  loading,
  onCancel,
  autoFocus
}: IAddIngredientProps) {
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
        recipeID: id,
        ingredient: { quantity, name, description }
      })
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
    />
  )
}
