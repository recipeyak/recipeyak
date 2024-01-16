import { DragElementWrapper, DragSourceOptions } from "react-dnd"

import { clx } from "@/classnames"
import { RecipeFetchResponse as Recipe } from "@/queries/recipeFetch"
import { normalizeUnitsFracs } from "@/text"
import {
  THEME_CSS_BAKING_POWDER,
  THEME_CSS_BAKING_SODA,
} from "@/themeConstants"

type Ingredient = Recipe["ingredients"][number]
interface IIngredientVIewProps {
  readonly quantity: Ingredient["quantity"]
  readonly name: Ingredient["name"]
  readonly description: Ingredient["description"]
  readonly optional: Ingredient["optional"]
  readonly dragRef: DragElementWrapper<DragSourceOptions> | undefined
}

export function IngredientViewContent({
  quantity,
  name,
  description,
  optional,
}: Omit<IIngredientVIewProps, "dragRef">) {
  description = description
    ? ", " + normalizeUnitsFracs(description).trim()
    : ""
  name = normalizeUnitsFracs(name.trim())
  quantity = normalizeUnitsFracs(quantity).trim()
  const isBakingSoda = name.toLocaleLowerCase() === "baking soda"
  const isBakingPowder = name.toLocaleLowerCase() === "baking powder"
  return (
    <>
      <span className="font-medium">{quantity}</span>{" "}
      <span
        className={clx(
          isBakingSoda && THEME_CSS_BAKING_SODA,
          isBakingPowder && THEME_CSS_BAKING_POWDER,
        )}
      >
        {name}
      </span>
      {description}{" "}
      {optional ? (
        <span className="text-[--color-text-muted] print:!text-black">
          [optional]
        </span>
      ) : (
        ""
      )}
    </>
  )
}

export default function IngredientView({
  quantity,
  name,
  description,
  optional,
  dragRef,
}: IIngredientVIewProps) {
  return (
    <div
      className="cursor-auto select-text justify-between whitespace-pre-wrap pb-2 leading-5"
      ref={dragRef}
    >
      <IngredientViewContent
        quantity={quantity}
        description={description}
        name={name}
        optional={optional}
      />
    </div>
  )
}
