import React from "react"
import { IIngredient } from "@/store/reducers/recipes"
import { capitalizeUnits } from "@/text"

interface IIngredientVIewProps {
  readonly quantity: IIngredient["quantity"]
  readonly name: IIngredient["name"]
  readonly description: IIngredient["description"]
  readonly optional: IIngredient["optional"]
}

export default function IngredientView({
  quantity,
  name,
  description,
  optional
}: IIngredientVIewProps) {
  const fmtDescription = description ? ", " + description : ""

  return (
    <p className="listitem-text justify-space-between">
      {capitalizeUnits(quantity)} {name}
      {fmtDescription}{" "}
      {optional ? <span className="text-muted">[optional]</span> : ""}
    </p>
  )
}
