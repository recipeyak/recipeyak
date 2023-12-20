import { DragElementWrapper, DragSourceOptions } from "react-dnd"

import { clx } from "@/classnames"
import { IIngredient } from "@/queries/recipeFetch"
import { normalizeUnitsFracs } from "@/text"
import {
  THEME_CSS_BAKING_POWDER,
  THEME_CSS_BAKING_SODA,
} from "@/themeConstants"

interface IIngredientVIewProps {
  readonly quantity: IIngredient["quantity"]
  readonly name: IIngredient["name"]
  readonly description: IIngredient["description"]
  readonly optional: IIngredient["optional"]
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
        <span className="text-[var(--color-text-muted)]">[optional]</span>
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
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line react/forbid-elements
    <p
      className="cursor-auto select-text justify-between whitespace-pre-wrap pb-[0.4rem] leading-5"
      ref={dragRef}
    >
      <IngredientViewContent
        quantity={quantity}
        description={description}
        name={name}
        optional={optional}
      />
    </p>
  )
}
