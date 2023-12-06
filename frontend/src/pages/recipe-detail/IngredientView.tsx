import { DragElementWrapper, DragSourceOptions } from "react-dnd"

import { IIngredient } from "@/queries/recipeFetch"
import { normalizeUnitsFracs } from "@/text"

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
  const fmtDescription = description
    ? ", " + normalizeUnitsFracs(description)
    : ""
  return (
    <>
      <span className="font-medium">
        {normalizeUnitsFracs(quantity).trim()}
      </span>{" "}
      {normalizeUnitsFracs(name.trim())}
      {fmtDescription.trim()}{" "}
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
