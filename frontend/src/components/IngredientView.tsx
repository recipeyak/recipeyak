import React from "react"
import { IIngredient } from "@/store/reducers/recipes"
import { capitalizeUnits } from "@/text"
import { DragElementWrapper, DragSourceOptions } from "react-dnd"

interface IIngredientVIewProps {
  readonly quantity: IIngredient["quantity"]
  readonly name: IIngredient["name"]
  readonly description: IIngredient["description"]
  readonly optional: IIngredient["optional"]
  readonly dragRef: DragElementWrapper<DragSourceOptions> | undefined
}

export default function IngredientView({
  quantity,
  name,
  description,
  optional,
  dragRef,
}: IIngredientVIewProps) {
  const fmtDescription = description ? ", " + description : ""

  return (
    <p className="listitem-text justify-space-between" ref={dragRef}>
      {capitalizeUnits(quantity)} {name}
      {fmtDescription}{" "}
      {optional ? <span className="text-muted">[optional]</span> : ""}
    </p>
  )
}
