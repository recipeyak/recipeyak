import { GripVertical } from "lucide-react"
import { DragElementWrapper, DragSourceOptions } from "react-dnd"

import { clx } from "@/classnames"
import { Markdown } from "@/components/Markdown"
import { RecipeFetchResponse as Recipe } from "@/queries/useRecipeFetch"
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
      <Markdown inline className="font-medium">
        {quantity}
      </Markdown>{" "}
      <Markdown
        inline
        className={clx(
          isBakingSoda && THEME_CSS_BAKING_SODA,
          isBakingPowder && THEME_CSS_BAKING_POWDER,
        )}
      >
        {name}
      </Markdown>
      <Markdown inline>{description}</Markdown>{" "}
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
  isEditing,
}: IIngredientVIewProps & { isEditing: boolean }) {
  return (
    <div
      className="flex cursor-auto select-text items-center justify-between gap-1 whitespace-pre-wrap pb-2 leading-5"
      ref={dragRef}
    >
      {isEditing && <GripVertical size={18} className="cursor-move" />}
      <span>
        <IngredientViewContent
          quantity={quantity}
          description={description}
          name={name}
          optional={optional}
        />
      </span>
    </div>
  )
}
