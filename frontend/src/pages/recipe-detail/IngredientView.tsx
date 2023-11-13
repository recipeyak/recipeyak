import { DragElementWrapper, DragSourceOptions } from "react-dnd"

import { IIngredient } from "@/queries/recipeFetch"
import { normalizeUnitsFracs } from "@/text"
import { styled } from "@/theme"

interface IIngredientVIewProps {
  readonly quantity: IIngredient["quantity"]
  readonly name: IIngredient["name"]
  readonly description: IIngredient["description"]
  readonly optional: IIngredient["optional"]
  readonly dragRef: DragElementWrapper<DragSourceOptions> | undefined
}

const IngredientViewInner = styled.p`
  white-space: pre-wrap;
  line-height: 1.25rem;
  padding-bottom: 0.4rem;
`

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
      <span className="fw-500">{normalizeUnitsFracs(quantity).trim()}</span>{" "}
      {normalizeUnitsFracs(name.trim())}
      {fmtDescription.trim()}{" "}
      {optional ? <span className="text-muted">[optional]</span> : ""}
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
    <IngredientViewInner
      className="justify-space-between selectable"
      ref={dragRef}
    >
      <IngredientViewContent
        quantity={quantity}
        description={description}
        name={name}
        optional={optional}
      />
    </IngredientViewInner>
  )
}
